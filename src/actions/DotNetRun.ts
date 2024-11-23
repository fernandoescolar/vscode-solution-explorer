import { CustomTerminalAction } from "./base/CustomTerminalAction";

export class DotNetRun extends CustomTerminalAction {
    constructor(private readonly projectPath: string) {
        super({
            name: "run",
            parameters: { projectPath },
            workingFolder: DotNetRun.getWorkingPath(projectPath)
        });
    }

    public toString(): string {
        return `Run project ${this.projectPath}`;
    }
}
