import * as path from "path";

export class ProjectFile {
    constructor(public readonly fullPath: string) {
        this.name = this.fullPath.split(path.sep).pop();
    }

    public name: string;

    public hasDependents: boolean = false;

    public dependents: ProjectFile[] = [];
}