import * as path from "path";

export class ProjectFile {
    constructor(public FullPath: string) {
        this.Name = this.FullPath.split(path.sep).pop();
    }

    public Name: string;

    public HasDependents: boolean = false;

    public Dependents: ProjectFile[] = [];
}