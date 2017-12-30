import * as path from "path";

export class ProjectReference {
    constructor(public FullPath: string) {
        this.Name = this.FullPath.split(path.sep).pop().split('.').pop();
    }

    public Name: string;
}