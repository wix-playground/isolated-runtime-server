const path = require("path");

module.exports = ({
  root,
  dependencies,
  npmVersionMap,
  npmPath,
  npmModules,
  edmPath,
  edmModules
}) => moduleName => {
  if (moduleName.startsWith("backend/")) {
    return moduleName.replace("backend/", `${root}/backend/`);
  }

  if (edmModules.includes(moduleName)) {
    return path.join(edmPath, "node_modules", "@wix", moduleName);
  }

  if (npmModules.includes(moduleName)) {
    const version = dependencies[moduleName];

    if (version) {
      const key = `${moduleName}@${version}`;
      const moduleRelativePath = npmVersionMap[key];
      return path.join(npmPath, moduleRelativePath, moduleName);
    }
  }

  return null;
};
