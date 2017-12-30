import * as fs from "../../async/fs";
import * as path from "path";
import { FileSystemBasedProject } from "./FileSystemBasedProject";
import { ProjectInSolution } from "../Solutions";
import { PackageReference } from "./PackageReference";
import * as Utilities from "../Utilities";
import * as xml from "../../async/xml";
import { ProjectFile } from "./ProjectFile";
import { ProjectFolder } from "./ProjectFolder";

export class OldProject extends FileSystemBasedProject {
    private loaded: boolean = false;
    private references: string[] = [];
    private packages: PackageReference[] = [];
    private document: any = null;
    private folders: string[] = [];
    private filesTree: any = null;
    private dependents: { [id: string]: string[] };
    private currentItemGroup: any = null;

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

        let folders: ProjectFolder[] = [];
        let files: ProjectFile[] = [];
        for(let i = 0; i < currentLevel.length; i++){
            let item = currentLevel[i];
            let stat = await fs.lstat(item.fullpath);
            if (stat.isDirectory()) {
                folders.push(new ProjectFolder(item.fullpath));
            } else {
                let projectFile = new ProjectFile(item.fullpath);
                if (this.dependents[item.virtualpath]) {
                    projectFile.HasDependents = true;
                    this.dependents[item.virtualpath].forEach(d => {
                        var dependentFullPath = path.join(path.dirname(this.FullPath), d);
                        projectFile.Dependents.push(new ProjectFile(dependentFullPath));
                    });
                }
                files.push(projectFile);
            }    
        }

        return { files, folders };
    }

    public async renameFile(filepath: string, name: string): Promise<void> {
        await this.checkProjectLoaded();
        let relativePath = this.getRelativePath(filepath);
        let newRelativePath = path.join(path.dirname(relativePath), name);
        this.renameInNodes(relativePath, newRelativePath);
        await super.renameFile(filepath, name);
        await this.saveProject();
    }

    public async deleteFile(filepath: string): Promise<void> {
        await this.checkProjectLoaded();
        let relativePath = this.getRelativePath(filepath);
        let folderRelativePath = path.dirname(relativePath);
        this.removeInNodes(relativePath);
        if (this.countInNodes(folderRelativePath, true) == 0) {
            this.currentItemGroupAdd('Folder', folderRelativePath, true);
        }
        await super.deleteFile(filepath);
        await this.saveProject();
    }
    public async createFile(folderpath: string, filename: string): Promise<string> {
        await this.checkProjectLoaded();
        
        let folderRelativePath = this.getRelativePath(folderpath);
        let relativePath = path.join(folderRelativePath, filename);
        let extension = relativePath.split('.').pop().toLocaleLowerCase();
        let type = ['cs', 'vb', 'fs'].indexOf(extension) >= 0 ? 'Compile' : 'Content';

        if (folderRelativePath) { 
            // maybe the folder was empty
            this.removeInNodes(folderRelativePath, true, ['Folder']);
        }
        this.currentItemGroupAdd(type, relativePath);
        await this.saveProject();
        return await super.createFile(folderpath, filename);
    }

    public async renameFolder(folderpath: string, name: string): Promise<void> {
        await this.checkProjectLoaded();
        let relativePath = this.getRelativePath(folderpath);
        let newRelativePath = path.join(path.dirname(relativePath), name);
        this.renameInNodes(relativePath, newRelativePath, true);
        super.renameFolder(folderpath, name);
        await this.saveProject();
    }

    public async deleteFolder(folderpath: string): Promise<void> {
        await this.checkProjectLoaded();
        let folderRelativePath = this.getRelativePath(folderpath);
        if (this.countInNodes(folderRelativePath, true) > 1) {
            throw new Error("Method not implemented for this kind of project yet.");    
        }

        this.removeInNodes(folderRelativePath, true, ['Folder']);
        await super.deleteFolder(folderpath);
        await this.saveProject();
    }

    public async createFolder(folderpath: string): Promise<void> {
        await this.checkProjectLoaded();
        let folderRelativePath = this.getRelativePath(folderpath);
        let parentRelativePath = path.dirname(folderRelativePath);
        if (parentRelativePath) { 
            // maybe the container folder was empty
            this.removeInNodes(parentRelativePath, true, ['Folder']);
        }
        this.currentItemGroupAdd('Folder', folderRelativePath, true);
        await super.createFolder(folderpath);
        await this.saveProject();
    }

    private async checkProjectLoaded(): Promise<void> {
        if (this.loaded) return;

        let content = await fs.readFile(this.FullPath, 'utf8');
        await this.parseProject(content);
        await this.parsePackages();
        this.loaded = true;
    }

    private async saveProject(): Promise<void> {
        let content = await xml.ParseToXml(this.document);
        await fs.writeFile(this.FullPath, content);
        await this.parseProject(content);
    }

    private async parseProject(content: string): Promise<void> {
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
        if (this.document.Project && this.document.Project.ItemGroup) {
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
                        addFile(ref);

                        let folder = ref.$.Include.replace(/\\/g, '/');
                        if (folder.endsWith('/'))
                            folder = folder.substring(0, folder.length - 1);
                        folders.push(folder);
                    });
                }
            });
        }

        this.filesTree = this.parseToTree(files);
        this.folders = folders;
        this.dependents = dependents;
    }

    private async parsePackages(): Promise<void> {
        this.packages = [];
        let packagesPath = path.join(path.dirname(this.FullPath), 'packages.config');
        if (!(await fs.exists(packagesPath))) return;
        
        let content = await fs.readFile(packagesPath, 'utf8');
        let packageRegEx = /<package\s+id=\"(.*)\"\s+version=\"(.*)\"\s+targetFramework=\"(.*)\"/g;
        let m: RegExpExecArray;        
        while ((m = packageRegEx.exec(content)) !== null) {
            this.packages.push(new PackageReference(m[1].trim(), m[2].trim()));
        }
    }

    private parseToTree(files: string[]): any {
        let tree = [];
        files.forEach(filepath => {
            filepath = filepath.replace(/\\/g, '/');
            let pathParts = filepath.split('/');
            let currentLevel = tree;
            let currentFullPath = path.dirname(this.FullPath);
            pathParts.forEach(part => {
                if (!part) return;
                currentFullPath = path.join(currentFullPath, part);
                let existingPathIndex = currentLevel.findIndex(i => i.name == part);
                if (existingPathIndex >= 0) {
                    currentLevel = currentLevel[existingPathIndex].children;
                } else {
                    let newPart = {
                        name: part,
                        virtualpath: filepath,
                        fullpath: currentFullPath,
                        children: [],
                    }

                    currentLevel.push(newPart);
                    currentLevel = newPart.children;
                }
            });
        });

        return tree;
    }

    private countInNodes(pattern: string, isFolder: boolean = false): number {
        pattern = pattern.replace(/\//g, '\\') + (isFolder ? '\\' : '');
        let counter = 0;
        let findPattern = ref => {
            if (ref.$.Include.startsWith(pattern)) {
                counter++;
            }
        };
        this.document.Project.ItemGroup.forEach(element => {
            if (element.Compile) {
                element.Compile.forEach(findPattern);
            }
            if (element.Content) {
                element.Content.forEach(findPattern);
            }
            if (element.None) {
                element.None.forEach(findPattern);
            }
            if (element.Folder) {
                element.Folder.forEach(findPattern);
            }
        });

        return counter;
    }

    private renameInNodes(pattern: string, newPattern: string, isFolder: boolean = false): void {
        pattern = pattern.replace(/\//g, '\\') + (isFolder ? '\\' : '');
        newPattern = newPattern.replace(/\//g, '\\') + (isFolder ? '\\' : '');
        let findPattern = ref => {
            if (ref.DependentUpon && ref.DependentUpon[0].startsWith(pattern)) {
                ref.DependentUpon[0] = ref.DependentUpon[0].replace(pattern, newPattern);
            } 
            if (ref.$.Include.startsWith(pattern)) {
                ref.$.Include = ref.$.Include.replace(pattern, newPattern);
            }
        };
        this.document.Project.ItemGroup.forEach(element => {
            if (element.Compile) {
                element.Compile.forEach(findPattern);
            }
            if (element.Content) {
                element.Content.forEach(findPattern);
            }
            if (element.None) {
                element.None.forEach(findPattern);
            }
            if (element.Folder) {
                element.Folder.forEach(findPattern);
            }
        });
    }

    private removeInNodes(pattern: string, isFolder: boolean = false, types: string[] = ['Compile', 'Content', 'None', 'Folder']): void {
        pattern = pattern.replace(/\//g, '\\') + (isFolder ? '\\' : '');
        this.document.Project.ItemGroup.forEach(element => {
            types.forEach(type => {
                if (!element[type]) return;
                element[type].forEach(node => {
                    if (node.DependentUpon && node.DependentUpon[0].startsWith(pattern)) {
                        delete node.DependentUpon;
                    }
                    if (node.$.Include.startsWith(pattern)) {
                        element[type].splice(element[type].indexOf(node), 1);
                    }
                });

                if (element[type].length == 0) delete element[type];
            });

            if (Object.keys(element).length == 0) {
                this.document.Project.ItemGroup.splice(this.document.Project.ItemGroup.indexOf(element), 1);
            }
        });
    }

    private currentItemGroupAdd(type: string, include: string, isFolder: boolean = false) {
        this.checkCurrentItemGroup();
        
        include = include.replace(/\//g, '\\') + (isFolder ? '\\' : '');

        if (!this.currentItemGroup[type]) this.currentItemGroup[type] = [];
        this.currentItemGroup[type].push({
            $: {
                Include: include
            }
        });
    }

    private checkCurrentItemGroup(): void {
        if (this.currentItemGroup && this.document.Project.ItemGroup.indexOf(this.currentItemGroup) >= 0) return;
        this.currentItemGroup = {};
        this.document.Project.ItemGroup.push(this.currentItemGroup);
    }

    private getRelativePath(fullpath: string): string {
        let relativePath = fullpath.replace(path.dirname(this.FullPath), '');
        if (relativePath.startsWith('/'))
            relativePath = relativePath.substring(1);

        return relativePath;
    }
}