import { CustomTerminalAction } from "./base/CustomTerminalAction";

export class Watch extends CustomTerminalAction {
    constructor(private readonly projectPath: string) {
        super({
            name: "watch",
            parameters: { projectPath },
            workingFolder: Watch.getWorkingPath(projectPath)
        });
    }

    public toString(): string {
        return `Watch project ${this.projectPath}`;
    }
}
