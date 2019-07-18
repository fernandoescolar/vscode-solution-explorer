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

export class CpsProject extends FileSystemBasedProject {
    private references: ProjectReference[] = [];
    private packages: PackageReference[] = [];
    private document: any = null;
    private loaded: boolean = false;

    constructor(projectInSolution: ProjectInSolution, document?: any) {
        super(projectInSolution, 'cps');

        if (document) {
            this.parseDocument(document);
            this.loaded = true;
        }
    }

    public async refresh(): Promise<void> {
        this.loaded = false;
        this.references = [];
        this.packages = [];
        await this.checkProjectLoaded();
    }

    public async getProjectReferences(): Promise<ProjectReference[]> {
        await this.checkProjectLoaded();
        return this.references;
    }

    public async getPackageReferences(): Promise<PackageReference[]> {
        await this.checkProjectLoaded();
        return this.packages;
    }

    public async getProjectFilesAndFolders(virtualPath?: string): Promise<{ files: ProjectFile[], folders: ProjectFolder[] }> {
        let result = await super.getProjectFilesAndFolders(virtualPath);
        let files: ProjectFile[] = [];
        let folders: ProjectFolder[] = [];

        let ignore = SolutionExplorerConfiguration.getNetCoreIgnore();
        result.files.forEach(file => {
            if (!this.fullPath.endsWith(file.fullPath) && ignore.indexOf(file.name.toLocaleLowerCase()) < 0)
                files.push(file);
        });

        
        result.folders.forEach(folder => {
            if (ignore.indexOf(folder.name.toLocaleLowerCase()) < 0)
                folders.push(folder);
        });
        
        return { files, folders };
    }

    public async getFolderList(): Promise<string[]> {
        let ignore = SolutionExplorerConfiguration.getNetCoreIgnore();
        let folderPath = path.dirname(this.projectInSolution.fullPath);
        let directories = await Utilities.getAllDirectoriesRecursive(folderPath, ignore);
        let result: string[] = [ '.' + path.sep ];
        directories.forEach(dirPath => result.push('.' + dirPath.replace(folderPath, '')));
        return result;
    }

    private async checkProjectLoaded() {
        if (this.loaded) return;

        await this.parseProject(this.fullPath);
        this.loaded = true;
    }

    private async parseProject(projectPath: string): Promise<void> {
        let content = await fs.readFile(projectPath, 'utf8');
        let document = await xml.ParseToJson(content);
        this.parseDocument(document);
    }

    private parseDocument(document: any): void {
        this.document = document;
        let project = CpsProject.getProjectElement(this.document);
        
        if (!project) project = { elements: [] };
        if (!project.elements || !Array.isArray(project.elements)) project.elements = [];
        
        project.elements.forEach(element => {
            if (element.name === 'ItemGroup') {
                if (!element.elements || !Array.isArray(element.elements)) element.elements = [];
                element.elements.forEach(e => {
                    if (e.name === 'PackageReference') {
                        this.packages.push(new PackageReference(e.attributes.Include, e.attributes.Include));
                    }
                    if (e.name === 'ProjectReference') {
                        let ref = e.attributes.Include.replace(/\\/g, path.sep).trim();
                        ref = ref.split(path.sep).pop();
                        let extension = ref.split('.').pop();
                        ref = ref.substring(0, ref.length - extension.length - 1);
                        this.references.push(new ProjectReference(ref, e.attributes.Include));
                    }
                });
            }
        });
    }
}