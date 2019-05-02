const util = require("util");
const exec = util.promisify(require("child_process").exec);
const { Context } = require("isolated-runtime-test-commons");

class EdmContext extends Context {
  constructor({ basePath }) {
    super({ basePath });

    this._modules = {};
  }

  withModule(name) {
    this._modules[name] = "ga";

    return this;
  }

  async build() {
    this.withFile(
      "package.json",
      JSON.stringify({ dependencies: this._modules })
    );

    await super.build();

    await exec("npm i", { cwd: this.basePath });
  }
}

module.exports = EdmContext;
