import { DotnetAction } from "./base/DotnetAction";
import { AddProjectReference } from "./AddProjectReference";

export class Pack extends DotnetAction {
    constructor(projectPath: string) {
        super(["pack", projectPath], AddProjectReference.getWorkingPath(projectPath));
    }
}
