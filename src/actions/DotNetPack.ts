import { CustomTerminalAction } from "./base/CustomTerminalAction";

export class DotNetPack extends CustomTerminalAction {
    constructor(private readonly projectPath: string) {
        super({
            name: "pack",
            parameters: { projectPath },
            workingFolder: DotNetPack.getWorkingPath(projectPath)
        });
    }

    public toString(): string {
        return `Pack project ${this.projectPath}`;
    }
}
