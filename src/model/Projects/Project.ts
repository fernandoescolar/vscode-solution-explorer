import * as fs from "fs";
import * as path from "path";
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

    abstract renameFile(filepath: string, name: string): void;

    abstract deleteFile(filepath: string): void;

    abstract createFile(folderpath: string, filename: string): void;

    abstract renameFolder(folderpath: string, name: string): void;

    abstract deleteFolder(folderpath: string): void;

    abstract createFolder(folderpath: string): void;
}