import * as fs from "../../async/fs";
import * as path from "path";
import { Project } from "./Project";
import { ProjectInSolution } from "../Solutions";
import { PackageReference } from "./PackageReference";
import * as Utilities from "../Utilities";
import * as xml from "../../async/xml";
import { ProjectFile } from "./ProjectFile";
import { ProjectFolder } from "./ProjectFolder";

export class OldProject extends Project {
    private loaded: boolean = false;
    private references: string[] = [];
    private packages: PackageReference[] = [];
    private document: any = null;
    private folders: string[] = [];
    private filesTree: any = null;
    private dependents: { [id: string]: string[] };

    constructor(projectInSolution: ProjectInSolution) {
        super(projectInSolution);
    }

    public async getProjectReferences(): Promise<string[]> {
        await this.checkProjectLoaded();
        return this.references;
    }
    public async getPackageReferences(): Promise<PackageReference[]> {
        await this.checkProjectLoaded();
        return this.packages;
    }
    public async getProjectFilesAndFolders(virtualPath?: string): Promise<{ files: ProjectFile[]; folders: ProjectFolder[]; }> {
        await this.checkProjectLoaded();
        let currentLevel = this.filesTree;
        if (virtualPath) {
            let pathParts = virtualPath.split('/');
            pathParts.forEach(part => {
                let existingPathIndex = currentLevel.findIndex(i => i.name == part);
                if (existingPathIndex >= 0) {
                    currentLevel = currentLevel[existingPathIndex].children;
                } 
            });
        }

        let folders = [];
        let files = [];
        currentLevel.forEach(item => {
            if (item.children.length == 0)
                files.push(item.name);
            else 
                folders.push(item.name);
        });

        return { files, folders };
    }
    public async renameFile(filepath: string, name: string): Promise<void> {
        await this.checkProjectLoaded();
        throw new Error("Method not implemented.");
    }
    public async deleteFile(filepath: string): Promise<void> {
        await this.checkProjectLoaded();
        throw new Error("Method not implemented.");
    }
    public async createFile(folderpath: string, filename: string): Promise<string> {
        await this.checkProjectLoaded();
        throw new Error("Method not implemented.");
    }
    public async renameFolder(folderpath: string, name: string): Promise<void> {
        await this.checkProjectLoaded();
        throw new Error("Method not implemented.");
    }
    public async deleteFolder(folderpath: string): Promise<void> {
        await this.checkProjectLoaded();
        throw new Error("Method not implemented.");
    }
    public async createFolder(folderpath: string): Promise<void> {
        await this.checkProjectLoaded();
        throw new Error("Method not implemented.");
    }

    private async checkProjectLoaded(): Promise<void> {
        if (this.loaded) return;

        await this.parseProject(this.FullPath);
        this.loaded = true;
    }

    private async parseProject(projectPath: string): Promise<void> {
        let content = await fs.readFile(projectPath, 'utf8');
        this.document =  await xml.ParseToJson(content);

        let files: string[] = [];
        let folders: string[] = [];
        let dependents: { [id: string]: string[] } = {};
        let addFile = ref => {
            if (ref.DependentUpon) {
                let parent = ref.DependentUpon[0];
                if (!dependents[parent]) dependents[parent] = [];
                dependents[parent].push(ref.$.Include);
            } else {
                files.push(ref.$.Include);
            }
        };
        this.document.Project.ItemGroup.forEach(element => {
            if (element.Reference) {
                element.Reference.forEach(ref => {
                    this.references.push(ref.$.Include);
                });
            }
            if (element.Compile) {
                element.Compile.forEach(addFile);
            }
            if (element.Content) {
                element.Content.forEach(addFile);
            }
            if (element.None) {
                element.None.forEach(addFile);
            }
            if (element.Folder) {
                element.Folder.forEach(ref => {
                    folders.push(ref.$.Include);
                });
            }
        });

        this.filesTree = this.parseToTree(files);
        this.folders = folders;
        this.dependents = dependents;
    }

    private parseToTree(files: string[]): any {
        var tree = [];
        files.forEach(path => {
            path = path.replace(/\\/g, '/');
            let pathParts = path.split('/');
            let currentLevel = tree;
            pathParts.forEach(part => {
                let existingPathIndex = currentLevel.findIndex(i => i.name == part);
                if (existingPathIndex >= 0) {
                    currentLevel = currentLevel[existingPathIndex].children;
                } else {
                    let newPart = {
                        name: part,
                        children: [],
                    }

                    currentLevel.push(newPart);
                    currentLevel = newPart.children;
                }
            });
        });

        return tree;
    }
}