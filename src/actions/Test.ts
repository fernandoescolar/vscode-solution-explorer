import { DotnetAction } from "./base/DotnetAction";
import { AddProjectReference } from "./AddProjectReference";

export class Test extends DotnetAction {
    constructor(projectPath: string) {
        super(["test", projectPath], AddProjectReference.getWorkingPath(projectPath));
    }
}
