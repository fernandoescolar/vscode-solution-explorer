import { DotnetAction } from "./base/DotnetAction";
import { AddProjectReference } from "./AddProjectReference";


export class Restore extends DotnetAction {
    constructor(private readonly projectPath: string) {
        super(["restore", projectPath], AddProjectReference.getWorkingPath(projectPath));
    }

    public toString(): string {
        return `Restore project ${this.projectPath}`;
    }
}
