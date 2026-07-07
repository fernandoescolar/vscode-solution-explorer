const path = require("path");

module.exports = function(filename, projectPath, folderPath, xml, props) {
    let namespace = props.RootNamespace;
    if (!namespace) namespace = props.Namespace;
    if (!namespace) namespace = props.MSBuildProjectName;
    if (!namespace && projectPath)  namespace = path.basename(projectPath, path.extname(projectPath));

    if (namespace && folderPath) {
        namespace += "." + folderPath.replace(path.dirname(projectPath), "").substring(1).replace(/[\\\/]/g, ".");
    }

    if (!namespace) {
        namespace = "Unknown";
    }

    namespace = namespace.replace(/[\\\-]/g, "_");

    return {
        namespace: namespace,
        name: path.basename(filename, path.extname(filename))
    }
};
