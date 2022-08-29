import { CustomTerminalAction } from "./base/CustomTerminalAction";

export class Restore extends CustomTerminalAction {
    constructor(private readonly projectPath: string) {
        super({
            name: "restore",
            parameters: { projectPath },
            workingFolder: Restore.getWorkingPath(projectPath)
        });
    }

    public toString(): string {
        return `Restore project ${this.projectPath}`;
    }
}
