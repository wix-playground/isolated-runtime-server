const path = require("path");

module.exports = ({
  root,
  dependencies,
  npmVersionMap,
  npmPath,
  npmModules
}) => moduleName => {
  if (moduleName.startsWith("backend/")) {
    return moduleName.replace("backend/", `${root}/backend/`);
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
