import { DotnetAction } from "./base/DotnetAction";

export class RemoveProjectReference extends DotnetAction {
    constructor(private readonly projectPath: string, private readonly referencedProjectPath: string) {
        super(["remove", projectPath, "reference", referencedProjectPath], RemoveProjectReference.getWorkingPath(projectPath));
    }

    public toString(): string {
        return `Remove project reference ${this.referencedProjectPath} from project ${this.projectPath}`;
    }
}
