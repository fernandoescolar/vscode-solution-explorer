import { DotnetAction } from "./base/DotnetAction";

export class RemovePackageReference extends DotnetAction {
    constructor(private readonly projectPath: string, private readonly packageId: string) {
        super(["remove", projectPath, "package", packageId], RemovePackageReference.getWorkingPath(projectPath));
    }

    public toString(): string {
        return `Remove package reference ${this.packageId} from project ${this.projectPath}`;
    }
}
