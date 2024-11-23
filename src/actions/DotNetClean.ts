import { CustomTerminalAction } from "./base/CustomTerminalAction";

export class DotNetClean extends CustomTerminalAction {
    constructor(private readonly projectPath: string) {
        super({
            name: "clean",
            parameters: { projectPath  },
            workingFolder: DotNetClean.getWorkingPath(projectPath)
        });
    }

    public toString(): string {
        return `Clean project ${this.projectPath}`;
    }
}
