import { CustomTerminalAction } from "./base/CustomTerminalAction";

export class DotNetRemoveProjectReference extends CustomTerminalAction {
    constructor(private readonly projectPath: string, private readonly referencedProjectPath: string) {
        super({
            name: "removeProjectReferenceFromProject",
            parameters: { projectPath, referencedProjectPath },
            workingFolder: DotNetRemoveProjectReference.getWorkingPath(projectPath)
        });
    }

    public toString(): string {
        return `Remove project reference ${this.referencedProjectPath} from project ${this.projectPath}`;
    }
}
