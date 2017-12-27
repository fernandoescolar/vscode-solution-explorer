import { ProjectInSolution } from "../Solutions";
import { PackageReference } from "./PackageReference";

export abstract class Project {
    constructor(protected readonly projectInSolution: ProjectInSolution) {
    }

    public get FullPath(): string {
        return this.projectInSolution.FullPath;
    }

    abstract getProjectReferences() : string[];

    abstract getPackageReferences() : PackageReference[];

    abstract getProjectFilesAndFolders(virtualPath?: string): { files: string[], folders: string[] };
}