import { CustomTerminalAction } from "./base/CustomTerminalAction";

export class AddExistingProject extends CustomTerminalAction {
    constructor(private readonly solutionPath: string, private readonly projectPath: string) {
        super({
            name: "addExistingProjectToSolution",
            parameters: { solutionPath, projectPath },
            workingFolder: AddExistingProject.getWorkingPath(solutionPath)
        });
    }

    public toString(): string {
        return `Add existing project ${this.projectPath} to solution ${this.solutionPath}`;
    }
}

