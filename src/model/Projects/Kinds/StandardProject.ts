import * as path from "path";
import * as fs from "../../../async/fs";
import * as xml from "../../../async/xml";
import * as SolutionExplorerConfiguration from "../../../SolutionExplorerConfiguration";
import * as Utilities from "../../Utilities";
import { ProjectInSolution } from "../../Solutions";
import { ProjectFile } from "../ProjectFile";
import { ProjectFolder } from "../ProjectFolder";
import { PackageReference } from "../PackageReference";
import { ProjectReference } from "../ProjectReference";
import { FileSystemBasedProject } from "./FileSystemBasedProject";

export class StandardProject extends FileSystemBasedProject {
    private loaded: boolean = false;
    private loadedPackages: boolean = false;
    private references: ProjectReference[] = [];
    private packages: PackageReference[] = [];
    private document: any = null;
    private folders: string[] = [];
    private filesTree: any = null;
    private dependents: { [id: string]: string[] };
    private currentItemGroup: any = null;
    private shouldReload: boolean = true;

    constructor(projectInSolution: ProjectInSolution, document?: any) {
        super(projectInSolution, 'standard');

        if (document) {
            this.parseDocument(document);
            this.loaded = true;
        }
    }

    public async getProjectReferences(): Promise<ProjectReference[]> {
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
            let pathParts = virtualPath.split(path.sep);
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
                    projectFile.hasDependents = true;
                    this.dependents[item.virtualpath].forEach(d => {
                        let dependentFullPath = path.join(path.dirname(this.fullPath), d);
                        projectFile.dependents.push(new ProjectFile(dependentFullPath));
                    });
                }
                files.push(projectFile);
            }    
        }

        folders.sort((a, b) => {
            let x = a.name.toLowerCase();
            let y = b.name.toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
        });
    
        files.sort((a, b) => {
            let x = a.name.toLowerCase();
            let y = b.name.toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
        });

        return { files, folders };
    }

    public async renameFile(filepath: string, name: string): Promise<string> {
        await this.checkProjectLoaded();
        let relativePath = this.getRelativePath(filepath);
        let newRelativePath = path.join(path.dirname(relativePath), name);
        this.renameInNodes(relativePath, newRelativePath);
        let newFilepath = await super.renameFile(filepath, name);
        await this.saveProject();
        return newFilepath;
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

    public async createFile(folderpath: string, filename: string, content?: string): Promise<string> {
        await this.checkProjectLoaded();
        
        let folderRelativePath = this.getRelativePath(folderpath);
        let relativePath = path.join(folderRelativePath, filename);
        let extension = relativePath.split('.').pop().toLocaleLowerCase();

        let type = 'None';
        let itemTypes = SolutionExplorerConfiguration.getItemTypes();
        if (itemTypes[extension]) {
            type = itemTypes[extension];
        } else {
            type = itemTypes['*'];
        }

        if (!type) type = 'None';

        if (folderRelativePath) { 
            // maybe the folder was empty
            this.removeInNodes(folderRelativePath, true, ['Folder']);
        }
        this.currentItemGroupAdd(type, relativePath);
        await this.saveProject();
        return await super.createFile(folderpath, filename, content);
    }

    public async renameFolder(folderpath: string, name: string): Promise<string> {
        await this.checkProjectLoaded();
        let relativePath = this.getRelativePath(folderpath);
        let newRelativePath = path.join(path.dirname(relativePath), name);
        this.renameInNodes(relativePath, newRelativePath, true);
        let newFolderpath = await super.renameFolder(folderpath, name);
        await this.saveProject();
        return newFolderpath;
    }

    public async deleteFolder(folderpath: string): Promise<void> {
        await this.checkProjectLoaded();
        let folderRelativePath = this.getRelativePath(folderpath);
        this.removeInNodes(folderRelativePath, true, ['Folder']);
        await super.deleteFolder(folderpath);
        await this.saveProject();
    }

    public async createFolder(folderpath: string): Promise<string> {
        await this.checkProjectLoaded();
        let folderRelativePath = this.getRelativePath(folderpath);
        let parentRelativePath = path.dirname(folderRelativePath);
        if (parentRelativePath) { 
            // maybe the container folder was empty
            this.removeInNodes(parentRelativePath, true, ['Folder']);
        }
        this.currentItemGroupAdd('Folder', folderRelativePath, true);
        let newFolderpath = await super.createFolder(folderpath);
        await this.saveProject();
        return newFolderpath;
    }

    public async getFolderList(): Promise<string[]> {
        let folderPath = path.dirname(this.projectInSolution.fullPath);
        let directories = await this.getFoldersFromTree(this.filesTree);

        directories.sort((a, b) => {
            let x = a.toLowerCase();
            let y = b.toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
        });

        let result: string[] = [ '.' + path.sep ];
        directories.forEach(dirPath => result.push('.' + dirPath.replace(folderPath, '')));
        return result;
    }

    public async moveFile(filepath: string, newfolderPath: string): Promise<string> {
        await this.checkProjectLoaded();

        let newFilepath = await super.moveFile(filepath, newfolderPath);
        let relativePath = this.getRelativePath(filepath);
        let newRelativePath = this.getRelativePath(newFilepath);
        this.renameInNodes(relativePath, newRelativePath);
        await this.saveProject();
        return newFilepath;
    }

    public async moveFolder(folderpath: string, newfolderPath: string): Promise<string> {
        await this.checkProjectLoaded();

        let newFolderPath = await super.moveFile(folderpath, newfolderPath);
        let relativePath = this.getRelativePath(folderpath);
        let newRelativePath = this.getRelativePath(newFolderPath);
        this.renameInNodes(relativePath, newRelativePath, true);
        await this.saveProject();
        return newFolderPath;
    }

    public async refresh(): Promise<void> {
        if (!this.shouldReload) {
            this.shouldReload = true;
            return;
        }

        this.loaded = false;
        this.loadedPackages = false;
        this.references = [];
        await this.checkProjectLoaded();
    }

    private async checkProjectLoaded(): Promise<void> {
        if (!this.loaded) {
            let content = await fs.readFile(this.fullPath, 'utf8');
            await this.parseProject(content);
            this.loaded = true;
        }
        if (!this.loadedPackages) {
            await this.parsePackages();
            this.loadedPackages = true;
        }
    }

    private async saveProject(): Promise<void> {
        this.shouldReload = false;
        let content = await xml.ParseToXml(this.document);
        await fs.writeFile(this.fullPath, content);
        await this.parseProject(content);
    }

    private async parseProject(content: string): Promise<void> {
        let document =  await xml.ParseToJson(content);
        this.parseDocument(document);
    }
    
    private parseDocument(document: any): void {
        this.loaded = true;
        this.document = document;
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
                        this.references.push(new ProjectReference(ref.$.Include, ref.$.Include));
                    });
                }
                if (element.Compile) {
                    element.Compile.forEach(addFile);
                }
                if (element.Content) {
                    element.Content.forEach(addFile);
                }
                if (element.TypeScriptCompile) {
                    element.TypeScriptCompile.forEach(addFile);
                }
                if (element.None) {
                    element.None.forEach(addFile);
                }
                if (element.Folder) {
                    element.Folder.forEach(ref => {
                        addFile(ref);

                        let folder = ref.$.Include.replace(/\\/g, path.sep);
                        if (folder.endsWith(path.sep))
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
        let packagesPath = path.join(path.dirname(this.fullPath), 'packages.config');
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
            filepath = filepath.replace(/\\/g, path.sep);
            let pathParts = filepath.split(path.sep);
            let currentLevel = tree;
            let currentFullPath = path.dirname(this.fullPath);
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
            if (element.TypeScriptCompile) {
                element.TypeScriptCompile.forEach(findPattern);
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
            if (element.TypeScriptCompile) {
                element.TypeScriptCompile.forEach(findPattern);
            }
            if (element.None) {
                element.None.forEach(findPattern);
            }
            if (element.Folder) {
                element.Folder.forEach(findPattern);
            }
        });
    }

    private removeInNodes(pattern: string, isFolder: boolean = false, types: string[] = ['Compile', 'Content', 'TypeScriptCompile', 'None', 'Folder']): void {
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
        if (this.document.Project.ItemGroup.length > 0) {
            this.currentItemGroup = this.document.Project.ItemGroup[this.document.Project.ItemGroup.length - 1];
        } else {
            this.currentItemGroup = {};
            this.document.Project.ItemGroup.push(this.currentItemGroup);
        }
    }

    private getRelativePath(fullpath: string): string {
        let relativePath = fullpath.replace(path.dirname(this.fullPath), '');
        if (relativePath.startsWith(path.sep))
            relativePath = relativePath.substring(1);

        return relativePath;
    }

    private async getFoldersFromTree(items: any): Promise<string[]> {
        if (!Array.isArray(items)) return [];
        let result: string[] = [];
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let stat = await fs.lstat(item.fullpath);
            if (stat.isDirectory()) {
                result.push(item.fullpath);
                let subItems = await this.getFoldersFromTree(item.children);
                subItems.forEach(si => result.push(si));
            }
        }
        
        return result;
    }
}