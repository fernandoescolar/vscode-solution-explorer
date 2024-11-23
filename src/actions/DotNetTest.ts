import { CustomTerminalAction } from "./base/CustomTerminalAction";

export class DotNetTest extends CustomTerminalAction {
    constructor(private readonly projectPath: string) {
        super({
            name: "test",
            parameters: { projectPath },
            workingFolder: DotNetTest.getWorkingPath(projectPath)
        });
    }

    public toString(): string {
        return `Test project ${this.projectPath}`;
    }
}
