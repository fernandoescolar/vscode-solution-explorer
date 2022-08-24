import { DotnetAction } from "./base/DotnetAction";
import { AddProjectReference } from "./AddProjectReference";

export class Clean extends DotnetAction {
    constructor(projectPath: string) {
        super(["clean", projectPath], AddProjectReference.getWorkingPath(projectPath));
    }
}
