import { DotnetAction } from "./base/DotnetAction";

export class AddExistingProject extends DotnetAction {
    constructor(solutionPath: string, projectPath: string) {
        super(["sln", solutionPath, "add", projectPath], AddExistingProject.getWorkingPath(solutionPath));
    }
}

