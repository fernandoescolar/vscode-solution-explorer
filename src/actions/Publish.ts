import { DotnetAction } from "./base/DotnetAction";
import { AddProjectReference } from "./AddProjectReference";

export class Publish extends DotnetAction {
    constructor(private readonly projectPath: string, private readonly outputPath: string) {
        super(["publish", projectPath, ...(outputPath!==''?["-o",outputPath]:[])], AddProjectReference.getWorkingPath(projectPath));
    }

    public toString(): string {
        return `Publish project ${this.projectPath}`;
    }
}
