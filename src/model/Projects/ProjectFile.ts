export class ProjectFile {
    constructor(public FullPath: string) {
        this.Name = this.FullPath.split('/').pop();
    }

    public Name: string;

    public HasDependents: boolean = false;

    public Dependents: ProjectFile[] = [];
}