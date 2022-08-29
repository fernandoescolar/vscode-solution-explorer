import { CustomTerminalAction } from "./base/CustomTerminalAction";

export class Test extends CustomTerminalAction {
    constructor(private readonly projectPath: string) {
        super({
            name: "test",
            parameters: { projectPath },
            workingFolder: Test.getWorkingPath(projectPath)
        });
    }

    public toString(): string {
        return `Test project ${this.projectPath}`;
    }
}
