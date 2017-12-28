import * as fs from "../../async/fs";
import * as path from "path";
import { FileSystemBasedProject } from "./FileSystemBasedProject";
import { ProjectInSolution } from "../Solutions";
import { PackageReference } from "./PackageReference";
import * as Utilities from "../Utilities";

export class CpsProject extends FileSystemBasedProject {
    private references: string[] = [];
    private packages: PackageReference[] = [];
    private loaded: boolean = false;

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

    public async getProjectFilesAndFolders(virtualPath?: string): Promise<{ files: string[], folders: string[] }> {
        let result = await super.getProjectFilesAndFolders();
        let files = [];
        let folders = [];

        result.files.forEach(file => {
            if (!this.FullPath.endsWith(file))
                files.push(file);
        });

        result.folders.forEach(folder => {
            if (folder != 'bin'
                && folder != 'obj'
                && folder != 'node_modules')
                folders.push(folder);
        });
        
        return {
            files: files,
            folders: folders
        };
    }

    private async checkProjectLoaded() {
        if (this.loaded) return;

        await this.parseProject(this.FullPath);
        this.loaded = true;
    }

    private async parseProject(projectPath: string): Promise<void> {
        let content = await fs.readFile(projectPath, 'utf8');
        let packageRegEx = /<PackageReference\s+Include=\"(.*)\"\s+Version=\"(.*)\"/g;
        let projectRegEx = /<ProjectReference\s+Include=\"(.*)\"/g;
        let m: RegExpExecArray;
        
        while ((m = packageRegEx.exec(content)) !== null) {
            this.packages.push(new PackageReference(m[1].trim(), m[2].trim()));
        }
    
        while ((m = projectRegEx.exec(content)) !== null) {
            this.references.push(m[1].replace(/\\/g, '/').trim());
        }
    }
}