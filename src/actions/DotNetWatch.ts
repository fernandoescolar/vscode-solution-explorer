import { CustomTerminalAction } from "./base/CustomTerminalAction";

export class DotNetWatch extends CustomTerminalAction {
    constructor(private readonly projectPath: string) {
        super({
            name: "watch",
            parameters: { projectPath },
            workingFolder: DotNetWatch.getWorkingPath(projectPath)
        });
    }

    public toString(): string {
        return `Watch project ${this.projectPath}`;
    }
}
