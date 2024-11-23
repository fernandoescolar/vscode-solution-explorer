import { CustomTerminalAction } from "./base/CustomTerminalAction";

export class DotNetPublish extends CustomTerminalAction {
    constructor(private readonly projectPath: string) {
        super({
            name: "publish",
            parameters: { projectPath },
            workingFolder: DotNetPublish.getWorkingPath(projectPath)
        });
    }

    public toString(): string {
        return `Publish project ${this.projectPath}`;
    }
}
