import { CustomTerminalAction } from "./base/CustomTerminalAction";

export class DotNetAddExistingProject extends CustomTerminalAction {
    constructor(private readonly solutionPath: string, private readonly projectPath: string) {
        super({
            name: "addExistingProjectToSolution",
            parameters: { solutionPath, projectPath },
            workingFolder: DotNetAddExistingProject.getWorkingPath(solutionPath)
        });
    }

    public toString(): string {
        return `Add existing project ${this.projectPath} to solution ${this.solutionPath}`;
    }
}

