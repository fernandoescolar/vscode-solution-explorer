import { CustomTerminalAction } from "./base/CustomTerminalAction";

export class RemoveProjectReference extends CustomTerminalAction {
    constructor(private readonly projectPath: string, private readonly referencedProjectPath: string) {
        super({
            name: "removeProjectReferenceFromProject",
            parameters: { projectPath, referencedProjectPath },
            workingFolder: RemoveProjectReference.getWorkingPath(projectPath)
        });
    }

    public toString(): string {
        return `Remove project reference ${this.referencedProjectPath} from project ${this.projectPath}`;
    }
}
