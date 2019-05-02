const NodeEnvironment = require("jest-environment-node");
const NpmContext = require("./context/NpmContext");
const EdmContext = require("./context/EdmContext");

class ITEnvironment extends NodeEnvironment {
  constructor(opts) {
    super(opts);

    this._npmContext = new NpmContext({ basePath: __dirname });
    this._edmContext = new EdmContext({ basePath: __dirname });

    this.global.npmPath = this._npmContext.basePath;
    this.global.edmPath = this._edmContext.basePath;
  }

  async setup() {
    super.setup();

    await this._npmContext
      .withModule({
        name: "sample-module",
        version: "0.0.1",
        files: [
          {
            file: "index.js",
            content: "module.exports = 'my-todo'"
          }
        ]
      })
      .build();

    await this._edmContext.withModule("@wix/wix-http-functions").build();
  }

  async teardown() {
    await this._npmContext.destroy();
    await this._edmContext.destroy();

    super.teardown();
  }
}

module.exports = ITEnvironment;
