import { DotnetAction } from "./base/DotnetAction";

export class AddProjectReference extends DotnetAction {
    constructor(projectPath: string, referencedProjectPath: string) {
        super(["add", projectPath, "reference", referencedProjectPath], AddProjectReference.getWorkingPath(projectPath));
    }
}
