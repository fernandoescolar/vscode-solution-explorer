import * as path from "path";

export class ProjectReference {
    constructor(public name: string) {
        this.Name = name;
    }

    public Name: string;
}