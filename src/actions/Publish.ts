import { DotnetAction } from "./base/DotnetAction";
import { AddProjectReference } from "./AddProjectReference";

export class Publish extends DotnetAction {
    constructor(private readonly projectPath: string) {
        super(["publish", projectPath], AddProjectReference.getWorkingPath(projectPath));
    }

    public toString(): string {
        return `Publish project ${this.projectPath}`;
    }
}
