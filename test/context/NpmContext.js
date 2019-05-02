const path = require("path");
const { Context } = require("isolated-runtime-test-commons");

class NpmContext extends Context {
  constructor({ basePath }) {
    super({ basePath });

    this._map = {};
  }

  withModule({ name, version, files }) {
    const key = `${name}@${version}`;
    const relativePath = path.join("WC_BEGIN", name, version, "WC_END");
    this._map[key] = relativePath;

    files.forEach(({ file, content }) => {
      this.withFile(path.join(relativePath, name, file), content);
    });

    return this;
  }

  async build() {
    this.withFile("map.json", JSON.stringify(this._map));
    this.withFile("current", this._folderName);

    await super.build();
  }
}

module.exports = NpmContext;
