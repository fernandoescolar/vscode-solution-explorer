import { CustomTerminalAction } from "./base/CustomTerminalAction";

export class DotNetRestore extends CustomTerminalAction {
    constructor(private readonly projectPath: string) {
        super({
            name: "restore",
            parameters: { projectPath },
            workingFolder: DotNetRestore.getWorkingPath(projectPath)
        });
    }

    public toString(): string {
        return `Restore project ${this.projectPath}`;
    }
}
