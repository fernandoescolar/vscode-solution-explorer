import { DotnetAction } from "./base/DotnetAction";

export class RemoveExistingProject extends DotnetAction {
    constructor(solutionPath: string, projectPath: string) {
        super(["sln", solutionPath, "remove", projectPath], RemoveExistingProject.getWorkingPath(solutionPath));
    }
}
