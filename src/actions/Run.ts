import { CustomTerminalAction } from "./base/CustomTerminalAction";

export class Run extends CustomTerminalAction {
    constructor(private readonly projectPath: string) {
        super({
            name: "run",
            parameters: { projectPath },
            workingFolder: Run.getWorkingPath(projectPath)
        });
    }

    public toString(): string {
        return `Run project ${this.projectPath}`;
    }
}
