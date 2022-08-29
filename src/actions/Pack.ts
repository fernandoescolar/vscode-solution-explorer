import { CustomTerminalAction } from "./base/CustomTerminalAction";

export class Pack extends CustomTerminalAction {
    constructor(private readonly projectPath: string) {
        super({
            name: "pack",
            parameters: { projectPath },
            workingFolder: Pack.getWorkingPath(projectPath)
        });
    }

    public toString(): string {
        return `Pack project ${this.projectPath}`;
    }
}
