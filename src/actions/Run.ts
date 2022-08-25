import { DotnetAction } from "./base/DotnetAction";
import { AddProjectReference } from "./AddProjectReference";

export class Run extends DotnetAction {
    constructor(private readonly projectPath: string) {
        super(["run", "--project", projectPath], AddProjectReference.getWorkingPath(projectPath));
    }

    public toString(): string {
        return `Run project ${this.projectPath}`;
    }
}
