import { DotnetAction } from "./base/DotnetAction";
import { AddProjectReference } from "./AddProjectReference";

export class Test extends DotnetAction {
    constructor(private readonly projectPath: string) {
        super(["test", projectPath], AddProjectReference.getWorkingPath(projectPath));
    }

    public toString(): string {
        return `Test project ${this.projectPath}`;
    }
}
