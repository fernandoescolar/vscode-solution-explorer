import { DotnetAction } from "./base/DotnetAction";

export class RemoveProjectReference extends DotnetAction {
    constructor(projectPath: string, referencedProjectPath: string) {
        super(["remove", projectPath, "reference", referencedProjectPath], RemoveProjectReference.getWorkingPath(projectPath));
    }
}
