import { CustomTerminalAction } from "./base/CustomTerminalAction";

export class Clean extends CustomTerminalAction {
    constructor(private readonly projectPath: string) {
        super({
            name: "clean",
            parameters: { projectPath  },
            workingFolder: Clean.getWorkingPath(projectPath)
        });
    }

    public toString(): string {
        return `Clean project ${this.projectPath}`;
    }
}
