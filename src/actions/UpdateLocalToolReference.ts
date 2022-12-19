import { CustomTerminalAction } from "./base/CustomTerminalAction";

export class UpdateLocalToolReference extends CustomTerminalAction {
    constructor(private readonly workspaceRoot: string, private readonly packageId: string) {
        super({
            name: 'updateLocalToolReference',
            parameters: { packageId },
            workingFolder: workspaceRoot
        });
    }

    public toString(): string {
        return `Update local tool reference ${this.packageId} in workspace ${this.workspaceRoot}`;
    }
}
