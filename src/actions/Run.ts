import { DotnetAction } from "./base/DotnetAction";
import { AddProjectReference } from "./AddProjectReference";

export class Run extends DotnetAction {
    constructor(projectPath: string) {
        super(["run", "--project", projectPath], AddProjectReference.getWorkingPath(projectPath));
    }
}
