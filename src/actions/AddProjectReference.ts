import { CustomTerminalAction } from "./base/CustomTerminalAction";

export class AddProjectReference extends CustomTerminalAction {
    constructor(private readonly projectPath: string, private readonly referencedProjectPath: string) {
        super({
            name: "addProjectReferenceToProject",
            parameters: { projectPath, referencedProjectPath },
            workingFolder: AddProjectReference.getWorkingPath(projectPath)
        });
    }

    public toString(): string {
        return `Add project reference ${this.referencedProjectPath} to project ${this.projectPath}`;
    }
}
