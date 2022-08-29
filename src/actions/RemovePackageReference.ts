import { CustomTerminalAction } from "./base/CustomTerminalAction";

export class RemovePackageReference extends CustomTerminalAction {
    constructor(private readonly projectPath: string, private readonly packageId: string) {
        super({
            name: "removePackageReferenceFromProject",
            parameters: { projectPath, packageId },
            workingFolder: RemovePackageReference.getWorkingPath(projectPath)
        });
    }

    public toString(): string {
        return `Remove package reference ${this.packageId} from project ${this.projectPath}`;
    }
}
