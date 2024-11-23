import { CustomTerminalAction } from "./base/CustomTerminalAction";

export class DotNetBuild extends CustomTerminalAction {
    constructor(private readonly projectPath: string) {
        super({
            name: "build",
            parameters: { projectPath  },
            workingFolder: DotNetBuild.getWorkingPath(projectPath)
        });
    }

    public toString(): string {
        return `Build project ${this.projectPath}`;
    }
}
