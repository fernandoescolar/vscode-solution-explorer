import { DotnetAction } from "./base/DotnetAction";

export class RemovePackageReference extends DotnetAction {
    constructor(projectPath: string, packageId: string) {
        super(["remove", projectPath, "package", packageId], RemovePackageReference.getWorkingPath(projectPath));
    }
}
