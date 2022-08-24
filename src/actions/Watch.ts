import { DotnetAction } from "./base/DotnetAction";
import { AddProjectReference } from "./AddProjectReference";

export class Watch extends DotnetAction {
    constructor(projectPath: string) {
        super(["watch", "run", "--project", projectPath], AddProjectReference.getWorkingPath(projectPath));
    }
}
