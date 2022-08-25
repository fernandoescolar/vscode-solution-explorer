import { DotnetAction } from "./base/DotnetAction";
import { AddProjectReference } from "./AddProjectReference";

export class Build extends DotnetAction {
    constructor(private readonly projectPath: string) {
        super(["build", projectPath], AddProjectReference.getWorkingPath(projectPath));
    }

    public toString(): string {
        return `Build project ${this.projectPath}`;
    }
}
