const NodeEnvironment = require("jest-environment-node");
const NpmContext = require("./context/NpmContext");

class ITEnvironment extends NodeEnvironment {
  constructor(opts) {
    super(opts);

    this._npmContext = new NpmContext({ basePath: __dirname });
    this.global.npmPath = this._npmContext.basePath;
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
  }

  async teardown() {
    await this._npmContext.destroy();

    super.teardown();
  }
}

module.exports = ITEnvironment;
