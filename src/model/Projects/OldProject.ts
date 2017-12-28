import * as fs from "../../async/fs";
import * as path from "path";
import { Project } from "./Project";
import { ProjectInSolution } from "../Solutions";
import { PackageReference } from "./PackageReference";
import * as Utilities from "../Utilities";
import * as xml2js from "xml2js";

export class OldProject extends Project {
    private references: string[] = [];
    private packages: PackageReference[] = [];

    constructor(projectInSolution: ProjectInSolution) {
        super(projectInSolution);
    }

    public getProjectReferences(): Promise<string[]> {
        throw new Error("Method not implemented.");
    }
    public getPackageReferences(): Promise<PackageReference[]> {
        throw new Error("Method not implemented.");
    }
    public getProjectFilesAndFolders(virtualPath?: string): Promise<{ files: string[]; folders: string[]; }> {
        throw new Error("Method not implemented.");
    }
    public renameFile(filepath: string, name: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    public deleteFile(filepath: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    public createFile(folderpath: string, filename: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    public renameFolder(folderpath: string, name: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    public deleteFolder(folderpath: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    public createFolder(folderpath: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    private async parseXml(projectPath: string): Promise<void> {
        let content = await fs.readFile(projectPath, 'utf8');
    }
}