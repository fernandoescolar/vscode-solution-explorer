import { DotnetAction } from "./base/DotnetAction";
import { AddProjectReference } from "./AddProjectReference";

export class Publish extends DotnetAction {
    constructor(projectPath: string) {
        super(["publish", projectPath], AddProjectReference.getWorkingPath(projectPath));
    }
}
