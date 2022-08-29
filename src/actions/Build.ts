import { CustomTerminalAction } from "./base/CustomTerminalAction";

export class Build extends CustomTerminalAction {
    constructor(private readonly projectPath: string) {
        super({
            name: "build",
            parameters: { projectPath  },
            workingFolder: Build.getWorkingPath(projectPath)
        });
    }

    public toString(): string {
        return `Build project ${this.projectPath}`;
    }
}
