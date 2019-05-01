const fs = require("fs-extra");
const path = require("path");

async function listModules(npmPath) {
  const moduleMapPath = path.join(npmPath, "map.json");
  const hasMapJson = await fs.exists(moduleMapPath);

  if (hasMapJson) {
    const mapText = await fs.readFile(moduleMapPath, "utf-8");
    const versionMap = JSON.parse(mapText);

    return {
      list: Object.keys(versionMap).map(mod => mod.split("@")[0]),
      versionMap
    };
  }

  return {
    list: [],
    versionMap: {}
  };
}

async function listUserDependencies(userRoot) {
  try {
    const userPackageLockJsonPath = path.join(
      userRoot,
      "backend",
      "wix-code-package-lock.json"
    );

    const userPackageLockJsonText = await fs.readFile(
      userPackageLockJsonPath,
      "utf-8"
    );

    return JSON.parse(userPackageLockJsonText).dependencies;
  } catch (error) {
    return {};
  }
}

module.exports = { listModules, listUserDependencies };
