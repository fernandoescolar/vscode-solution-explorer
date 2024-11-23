import { CustomTerminalAction } from "./base/CustomTerminalAction";

export class DotNetRemoveExistingProject extends CustomTerminalAction {
    constructor(private readonly solutionPath: string, private readonly projectPath: string) {
        super({
            name: "removeProjectFromSolution",
            parameters: { solutionPath, projectPath },
            workingFolder: DotNetRemoveExistingProject.getWorkingPath(solutionPath)
        });
    }

    public toString(): string {
        return `Remove existing project ${this.projectPath} from solution ${this.solutionPath}`;
    }
}
