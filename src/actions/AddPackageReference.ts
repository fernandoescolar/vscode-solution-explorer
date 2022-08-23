import { DotnetAction } from "./base/DotnetAction";

export class AddPackageReference extends DotnetAction {
    constructor(projectPath: string, packageId: string, packageVersion?: string) {
        super(AddPackageReference.getArguments(projectPath, packageId, packageVersion), AddPackageReference.getWorkingPath(projectPath));
    }

    private static getArguments(projectPath: string, packageId: string, packageVersion: string | undefined): string[] {
        if (packageVersion) {
            return ["add", projectPath, "package", packageId, "-v", packageVersion];
        } else {
            return ["add", projectPath, "package", packageId];
        }
    }
}