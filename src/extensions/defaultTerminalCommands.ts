export type TerminalCommand = keyof typeof defaultTerminalCommands;

export const defaultTerminalCommands = {
    addExistingProjectToSolution: [ "dotnet", "sln", "\"$solutionPath\"", "add", "\"$projectPath\"" ],
    addPackageReferenceToProject: [ "dotnet", "add", "\"$projectPath\"", "package", "\"$packageId\"" ],
    addPackageReferenceToProjectWithVersion: [ "dotnet", "add", "\"$projectPath\"", "package", "\"$packageId\"", "-v", "\"$packageVersion\"" ],
    addProjectReferenceToProject: [ "dotnet", "add", "\"$projectPath\"", "reference", "\"$referencedProjectPath\"" ],
    build: [ "dotnet", "build", "\"$projectPath\"" ],
    clean: [ "dotnet", "clean", "\"$projectPath\"" ],
    createProject: [ "dotnet", "new", "\"$projectType\"", "-lang", "\"$language\"", "-n", "\"$projectName\"", "-o", "\"$folderName\"" ],
    createSolution: [ "dotnet", "new", "sln", "-n", "\"$solutionName\"" ],
    pack: [ "dotnet", "pack", "\"$projectPath\"" ],
    publish: [ "dotnet", "publish", "\"$projectPath\"" ],
    removeProjectFromSolution: [ "dotnet", "sln", "\"$solutionPath\"", "remove", "\"$projectPath\"" ],
    removePackageReferenceFromProject: [ "dotnet", "remove", "\"$projectPath\"", "package", "\"$packageId\"" ],
    removeProjectReferenceFromProject: [ "dotnet", "remove", "\"$projectPath\"", "reference", "\"$referencedProjectPath\"" ],
    restore: [ "dotnet", "restore", "\"$projectPath\"" ],
    run: [ "dotnet", "run", "--project", "\"$projectPath\"" ],
    test: [ "dotnet", "test", "\"$projectPath\"" ],
    watch: [ "dotnet", "watch", "run", "--project", "\"$projectPath\"" ]
};
