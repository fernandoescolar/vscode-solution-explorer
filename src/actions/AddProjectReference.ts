import { DotnetAction } from "./base/DotnetAction";

export class AddProjectReference extends DotnetAction {
    constructor(private readonly projectPath: string, private readonly referencedProjectPath: string) {
        super(["add", projectPath, "reference", referencedProjectPath], AddProjectReference.getWorkingPath(projectPath));
    }

    public toString(): string {
        return `Add project reference ${this.referencedProjectPath} to project ${this.projectPath}`;
    }
}
