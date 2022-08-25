import { DotnetAction } from "./base/DotnetAction";
import { AddProjectReference } from "./AddProjectReference";

export class Watch extends DotnetAction {
    constructor(private readonly projectPath: string) {
        super(["watch", "run", "--project", projectPath], AddProjectReference.getWorkingPath(projectPath));
    }

    public toString(): string {
        return `Watch project ${this.projectPath}`;
    }
}
