import { TerminalCommand } from "@extensions/defaultTerminalCommands";
import { CustomTerminalAction } from "./base/CustomTerminalAction";

export class AddLocalToolReference extends CustomTerminalAction {
    constructor(private readonly workspaceRoot: string, private readonly packageId: string, packageVersion?: string) {
        super({
            name: AddLocalToolReference.getTerminalCommand(workspaceRoot, packageId, packageVersion),
            parameters: { packageId, packageVersion: packageVersion || "" },
            workingFolder: workspaceRoot
        });
    }

    public toString(): string {
        return `Add local tool reference ${this.packageId} to workspace ${this.workspaceRoot}`;
    }

    private static getTerminalCommand(workspaceRoot: string, packageId: string, packageVersion: string | undefined): TerminalCommand {
        if (packageVersion) {
            return "addLocalToolReferenceWithVersion";
        } else {
            return "addLocalToolReference";
        }
    }
}
