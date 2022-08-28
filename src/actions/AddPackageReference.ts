import { TerminalCommand } from "@extensions/defaultTerminalCommands";
import { CustomTerminalAction } from "./base/CustomTerminalAction";

export class AddPackageReference extends CustomTerminalAction {
    constructor(private readonly projectPath: string, private readonly packageId: string, packageVersion?: string) {
        super({
            name: AddPackageReference.getTerminalCommand(projectPath, packageId, packageVersion),
            parameters: { projectPath, packageId, packageVersion: packageVersion || "" },
            workingFolder: AddPackageReference.getWorkingPath(projectPath)
        });
    }

    public toString(): string {
        return `Add package reference ${this.packageId} to project ${this.projectPath}`;
    }

    private static getTerminalCommand(projectPath: string, packageId: string, packageVersion: string | undefined): TerminalCommand {
        if (packageVersion) {
            return "addPackageReferenceToProjectWithVersion";
        } else {
            return "addPackageReferenceToProject";
        }
    }
}
