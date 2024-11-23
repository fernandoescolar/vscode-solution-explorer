import { CustomTerminalAction } from "./base/CustomTerminalAction";

export class DotNetAddProjectReference extends CustomTerminalAction {
    constructor(private readonly projectPath: string, private readonly referencedProjectPath: string) {
        super({
            name: "addProjectReferenceToProject",
            parameters: { projectPath, referencedProjectPath },
            workingFolder: DotNetAddProjectReference.getWorkingPath(projectPath)
        });
    }

    public toString(): string {
        return `Add project reference ${this.referencedProjectPath} to project ${this.projectPath}`;
    }
}
