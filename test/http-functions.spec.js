const { Context, randoms } = require("isolated-runtime-test-commons");
const axios = require("axios");
const listen = require("..");

describe("Http Functions", () => {
  let context;
  let server;
  let client;
  let root;

  beforeEach(() => {
    root = randoms.folder();
    server = listen({
      untrustedCodePath: __dirname,
      edmPath: global.edmPath,
      npmPath: global.npmPath
    });
    client = axios.create({ baseURL: `http://localhost:${server.port}` });
  });

  afterEach(() => server.close());

  describe("With user simple http function", () => {
    beforeEach(async () => {
      context = await new Context({
        basePath: __dirname,
        root
      })
        .withFile(
          "backend/http-functions.js",
          `
            import { ok } from 'wix-http-functions';

            const response = (todos) => ({
              headers: {
                'Content-Type': 'application/json'
              },
              body: {
                todos
              }
            })

            export function get_todos(request) {
              return ok(response(['todo1', 'todo2']));
            }
          `
        )
        .build();
    });

    afterEach(() => context.destroy());

    test("Runs sandboxed code", async () => {
      const response = await client.get(`${root}/_functions/todos/`);

      expect(response.status).toBe(200);
      expect(response.data).toEqual({
        todos: ["todo1", "todo2"]
      });
    });
  });

  describe("With http-functions using npm modules", () => {
    beforeEach(async () => {
      context = await new Context({
        basePath: __dirname,
        root
      })
        .withFile(
          "backend/wix-code-package-lock.json",
          JSON.stringify({
            dependencies: {
              "sample-module": "0.0.1"
            }
          })
        )
        .withFile(
          "backend/http-functions.js",
          `
              import { ok } from 'wix-http-functions';
              import todoTitle from 'sample-module';

              const response = (todos) => ({
                headers: {
                  'Content-Type': 'application/json'
                },
                body: {
                  todos
                }
              })

              export function get_todos_with_npm(request) {
                return ok(response([todoTitle]));
              }
            `
        )
        .build();
    });

    afterEach(() => context.destroy());

    test("runs sandboxed code using npm modules", async () => {
      const response = await client.get(`${root}/_functions/todos_with_npm/`);

      expect(response.status).toBe(200);
      expect(response.data).toEqual({
        todos: ["my-todo"]
      });
    });
  });

  describe("With user code requiring absolute user-modules", () => {
    beforeEach(async () => {
      context = await new Context({ basePath: __dirname, root })
        .withFile(
          "backend/http-functions.js",
          `
          import { ok } from 'wix-http-functions';
          import { multiply } from 'backend/multiply.js'

          export function get_multiply(request) {
            const { a, b } = request.query

            const response = {
              headers: {
                'Content-Type': 'application/json'
              },
              body: {
                result: multiply(a, b)
              }
            }

            return ok(response);
          }
        `
        )
        .withFile(
          "backend/multiply.js",
          `
          function multiply(a, b) {
            return a * b
          }

          module.exports = {
            multiply
          }`
        )
        .build();
    });

    afterEach(() => context.destroy());

    test("runs the user method with the requires and returns the result", async () => {
      const response = await client.get(`${root}/_functions/multiply?a=4&b=6`);

      expect(response.status).toBe(200);
      expect(response.data).toEqual({ result: 24 });
    });
  });
});
