import { ProjectInSolution } from "../Solutions";
import { ProjectFile } from "./ProjectFile";
import { ProjectFolder } from "./ProjectFolder";
import { PackageReference } from "./PackageReference";
import { ProjectReference } from "./ProjectReference";

export abstract class Project {
    private _hasReferences: boolean = true;

    constructor(protected readonly projectInSolution: ProjectInSolution) {
    }

    public get fullPath(): string {
        return this.projectInSolution.fullPath;
    }

    public get hasReferences(): boolean {
        return this._hasReferences;
    }

    protected setHasReferences(value: boolean) {
        this._hasReferences = value;
    }

    public abstract getProjectReferences() : Promise<ProjectReference[]>;

    public abstract getPackageReferences() : Promise<PackageReference[]>;

    public abstract getProjectFilesAndFolders(virtualPath?: string): Promise<{ files: ProjectFile[], folders: ProjectFolder[] }>;

    public abstract renameFile(filepath: string, name: string): Promise<void>;

    public abstract deleteFile(filepath: string): Promise<void>;

    public abstract createFile(folderpath: string, filename: string): Promise<string>;

    public abstract renameFolder(folderpath: string, name: string): Promise<void>;

    public abstract deleteFolder(folderpath: string): Promise<void>;

    public abstract createFolder(folderpath: string): Promise<void>;
}