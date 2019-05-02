const fs = require("fs-extra");
const path = require("path");

function removeWixScope(moduleName) {
  return moduleName.split("/")[1];
}

async function listModules(edmPath) {
  const packageJsonPath = path.join(edmPath, "package.json");
  const hasPackageJson = await fs.exists(packageJsonPath);

  if (hasPackageJson) {
    const packageJsonText = await fs.readFile(packageJsonPath, "utf-8");
    const packageJson = JSON.parse(packageJsonText);

    return Object.keys(packageJson.dependencies).map(removeWixScope);
  }

  return [];
}

module.exports = { listModules };
