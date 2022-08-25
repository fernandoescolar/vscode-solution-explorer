import { DotnetAction } from "./base/DotnetAction";

export class AddExistingProject extends DotnetAction {
    constructor(private readonly solutionPath: string, private readonly projectPath: string) {
        super(["sln", solutionPath, "add", projectPath], AddExistingProject.getWorkingPath(solutionPath));
    }

    public toString(): string {
        return `Add existing project ${this.projectPath} to solution ${this.solutionPath}`;
    }
}

