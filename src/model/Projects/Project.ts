import { ProjectInSolution } from "../Solutions";
import { PackageReference } from "./PackageReference";

export abstract class Project {
    private hasReferences: boolean = true;

    constructor(protected readonly projectInSolution: ProjectInSolution) {
    }

    public get FullPath(): string {
        return this.projectInSolution.FullPath;
    }

    public get HasReferences(): boolean {
        return this.hasReferences;
    }

    protected setHasReferences(value: boolean) {
        this.hasReferences = value;
    }

    public abstract getProjectReferences() : Promise<string[]>;

    public abstract getPackageReferences() : Promise<PackageReference[]>;

    public abstract getProjectFilesAndFolders(virtualPath?: string): Promise<{ files: string[], folders: string[] }>;

    public abstract renameFile(filepath: string, name: string): Promise<void>;

    public abstract deleteFile(filepath: string): Promise<void>;

    public abstract createFile(folderpath: string, filename: string): Promise<string>;

    public abstract renameFolder(folderpath: string, name: string): Promise<void>;

    public abstract deleteFolder(folderpath: string): Promise<void>;

    public abstract createFolder(folderpath: string): Promise<void>;
}