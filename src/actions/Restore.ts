import { DotnetAction } from "./base/DotnetAction";
import { AddProjectReference } from "./AddProjectReference";


export class Restore extends DotnetAction {
    constructor(projectPath: string) {
        super(["restore", projectPath], AddProjectReference.getWorkingPath(projectPath));
    }
}
