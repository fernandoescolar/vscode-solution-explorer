import * as path from "path";

export class ProjectFolder {
    constructor(public readonly fullPath: string) {
        this.name = this.fullPath.split(path.sep).pop();
    }

    public name: string;
}