export class ProjectReference {
    constructor(public FullPath: string) {
        this.Name = this.FullPath.split('/').pop().split('.').pop();
    }

    public Name: string;
}