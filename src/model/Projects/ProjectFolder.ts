import * as path from "path";

export class ProjectFolder {
    constructor(public FullPath: string) {
        this.Name = this.FullPath.split(path.sep).pop();
    }

    public Name: string;
}