import { DotnetAction } from "./base/DotnetAction";
import { AddProjectReference } from "./AddProjectReference";

export class Pack extends DotnetAction {
    constructor(private readonly projectPath: string) {
        super(["pack", projectPath], AddProjectReference.getWorkingPath(projectPath));
    }

    public toString(): string {
        return `Pack project ${this.projectPath}`;
    }
}
