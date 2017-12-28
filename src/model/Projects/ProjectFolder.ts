export class ProjectFolder {
    constructor(public FullPath: string) {
        this.Name = this.FullPath.split('/').pop();
    }

    public Name: string;
}