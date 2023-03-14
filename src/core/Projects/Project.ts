import * as path from "@extensions/path";
import { NugetDependencies } from "@extensions/nuget-dependencies";
import { PackageReference, ProjectItemEntry, ProjectReference, Reference } from "./Items";
import { ProjectFileStat } from "./ProjectFileStat";
import { RelativeFilePosition } from "./RelativeFilePosition";

export abstract class Project {
    constructor(public readonly projectFullPath: string, private readonly withReferences?: boolean) {
    }

    public fileExtension: string = '';

    public get name(): string {
        return path.basename(this.fullPath, path.extname(this.fullPath));
    }

    public get extension(): string {
        return path.extname(this.fullPath).substring(1);
    }

    public get fullPath(): string {
        return this.projectFullPath;
    }

    public get type(): string {
        return "";
    }

    public get hasReferences(): boolean {
        return this.withReferences === undefined || this.withReferences;
    }

    public abstract getReferences(): Promise<Reference[]>;

    public abstract getProjectReferences(): Promise<ProjectReference[]>;

    public abstract getPackageReferences(): Promise<PackageReference[]>;

    public abstract getProjectItemEntries(): Promise<ProjectItemEntry[]>;

    public abstract getNugetPackageDependencies(): Promise<NugetDependencies>;

    public abstract renameFile(filepath: string, name: string): Promise<string>;

    public abstract deleteFile(filepath: string): Promise<void>;

    public abstract createFile(folderpath: string, filename: string, content?: string, relativePosition?:RelativeFilePosition): Promise<string>;

    public abstract renameFolder(folderpath: string, oldname: string, newname: string): Promise<string>;

    public abstract deleteFolder(folderpath: string): Promise<void>;

    public abstract createFolder(folderpath: string): Promise<string>;

    public abstract getFolderList(): Promise<string[]>;

    public abstract statFile(filepath: string, folderPath: string): Promise<ProjectFileStat>;

    public abstract moveFile(filepath: string, newfolderPath: string): Promise<string>;

    public abstract moveFileUp(filepath: string): Promise<string>;

    public abstract moveFileDown(filepath: string): Promise<string>;

    public abstract moveFolder(folderpath: string, newfolderPath: string): Promise<string>;

    public abstract refresh(): Promise<void>;

    public abstract preload(): Promise<void>;
}
