import { DotnetAction } from "./base/DotnetAction";

export class RemoveExistingProject extends DotnetAction {
    constructor(private readonly solutionPath: string, private readonly projectPath: string) {
        super(["sln", solutionPath, "remove", projectPath], RemoveExistingProject.getWorkingPath(solutionPath));
    }

    public toString(): string {
        return `Remove existing project ${this.projectPath} from solution ${this.solutionPath}`;
    }
}
