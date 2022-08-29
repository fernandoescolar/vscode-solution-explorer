import { CustomTerminalAction } from "./base/CustomTerminalAction";

export class Publish extends CustomTerminalAction {
    constructor(private readonly projectPath: string) {
        super({
            name: "publish",
            parameters: { projectPath },
            workingFolder: Publish.getWorkingPath(projectPath)
        });
    }

    public toString(): string {
        return `Publish project ${this.projectPath}`;
    }
}
