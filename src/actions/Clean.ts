import { DotnetAction } from "./base/DotnetAction";
import { AddProjectReference } from "./AddProjectReference";

export class Clean extends DotnetAction {
    constructor(private readonly projectPath: string) {
        super(["clean", projectPath], AddProjectReference.getWorkingPath(projectPath));
    }

    public toString(): string {
        return `Clean project ${this.projectPath}`;
    }
}
