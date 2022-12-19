import { CustomTerminalAction } from "./base/CustomTerminalAction";

export class RemoveLocalToolReference extends CustomTerminalAction {
    constructor(private readonly workspaceRoot: string, private readonly packageId: string) {
        super({
            name: "removeLocalToolReference",
            parameters: { packageId },
            workingFolder: workspaceRoot
        });
    }

    public toString(): string {
        return `Remove local tool reference ${this.packageId} from workspace ${this.workspaceRoot}`;
    }
}
