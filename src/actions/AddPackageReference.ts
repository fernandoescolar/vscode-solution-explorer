import { DotnetAction } from "./base/DotnetAction";

export class AddPackageReference extends DotnetAction {
    constructor(private readonly projectPath: string, private readonly packageId: string, packageVersion?: string) {
        super(AddPackageReference.getArguments(projectPath, packageId, packageVersion), AddPackageReference.getWorkingPath(projectPath));
    }

    public toString(): string {
        return `Add package reference ${this.packageId} to project ${this.projectPath}`;
    }

    private static getArguments(projectPath: string, packageId: string, packageVersion: string | undefined): string[] {
        if (packageVersion) {
            return ["add", projectPath, "package", packageId, "-v", packageVersion];
        } else {
            return ["add", projectPath, "package", packageId];
        }
    }
}
