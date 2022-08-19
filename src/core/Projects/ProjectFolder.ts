import * as path from "@extensions/path";

export class ProjectFolder {
    constructor(public readonly fullPath: string) {
        this.name = this.fullPath.split(path.sep).pop() || "";
    }

    public name: string;
}