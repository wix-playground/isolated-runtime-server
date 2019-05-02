const express = require("express");
const path = require("path");
const { IsolatedRuntime } = require("isolated-runtime");
const npm = require("./lib/npm-modules");
const edm = require("./lib/edm-modules");

const compilerModulePath = require.resolve("vm2-babel-compiler");

module.exports = ({ untrustedCodePath, edmPath, npmPath }) => {
  const runtime = new IsolatedRuntime({
    compilerModulePath,
    resolverModulePath: path.resolve(__dirname, "./lib/resolver.js")
  });

  const app = express();
  app.use("/:user/_functions/:name", async (req, res) => {
    const { name, user } = req.params;
    const method = req.method.toLowerCase();

    const funcName = `${method}_${name}`;
    const userRoot = path.join(untrustedCodePath, user);
    let body = "";

    const {
      list: npmModules,
      versionMap: npmVersionMap
    } = await npm.listModules(npmPath);
    const edmModules = await edm.listModules(edmPath);

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", async () => {
      const dependencies = await npm.listUserDependencies(userRoot);
      const result = await runtime.run({
        root: userRoot,
        file: "backend/http-functions.js",
        funcName,
        args: {
          resolverPath: path.resolve(
            __dirname,
            "./lib/http-function-args-resolver.js"
          ),
          original: [
            req.originalUrl,
            req.method,
            body,
            req.headers,
            req.connection.remoteAddress
          ]
        },
        external: {
          modules: ["backend/*", ...edmModules, ...npmModules],
          transitive: true
        },
        whitelistedPaths: [edmPath, npmPath],

        resolverOptions: {
          npmPath,
          root: userRoot,
          npmModules,
          dependencies,
          npmVersionMap,
          edmPath,
          edmModules
        }
      });

      res.status(result.status);
      Object.keys(result.headers).forEach(h => {
        res.set(h, result.headers[h]);
      });
      res.json(result.body);
    });
  });

  const server = app.listen(0);

  return {
    close: async () => {
      await runtime.shutdown();
      await server.close();
    },
    port: server.address().port
  };
};
