import * as fs from "fs";
import * as path from "path";
import { Project } from "./Project";
import { ProjectInSolution } from "../Solutions";
import { PackageReference } from "./PackageReference";
import * as Utilities from "../Utilities";

export class CpsProject extends Project {
    private references: string[] = [];
    private packages: PackageReference[] = [];

    constructor(projectInSolution: ProjectInSolution) {
        super(projectInSolution);
        this.parseProject(projectInSolution.FullPath);
    }

    getProjectReferences(): string[] {
        return this.references;
    }

    getPackageReferences(): PackageReference[] {
        return this.packages;
    }

    getProjectFilesAndFolders(virtualPath?: string): { files: string[], folders: string[] } {
        let folderPath = path.dirname(this.projectInSolution.FullPath);
        if (virtualPath)
            folderPath = path.join(folderPath, virtualPath);
        
        let result = Utilities.getDirectoryItemsSync(folderPath);
        let files = [];
        let folders = [];

        result.Files.forEach(file => {
            if (!this.FullPath.endsWith(file))
                files.push(file);
        });

        result.Directories.forEach(folder => {
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

    renameFile(filepath: string, name: string): void {
        let folder = path.dirname(filepath);
        let newFilepath = path.join(folder, name);
        fs.renameSync(filepath, newFilepath);
    }

    deleteFile(filepath: string): void {
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }
    }

    createFile(folderpath: string, filename: string): string {
        let projectPath = path.dirname(this.FullPath);
        let filepath = path.join(projectPath, folderpath, filename);
        if (!fs.existsSync(filepath)) {
            fs.writeFileSync(filepath, "");
        }

        return filepath;
    }

    renameFolder(folderpath: string, name: string): void {
        let projectPath = path.dirname(this.FullPath);
        let fullfolderpath = path.join(projectPath, folderpath);
        let newfolderpath = path.join(path.dirname(projectPath), name);
        fs.renameSync(fullfolderpath, newfolderpath);
    }

    deleteFolder(folderpath: string): void {
        let projectPath = path.dirname(this.FullPath);
        let fullfolderpath = path.join(projectPath, folderpath);
        fs.rmdirSync(fullfolderpath);
    }

    createFolder(folderpath: string): void {
        let projectPath = path.dirname(this.FullPath);
        let fullfolderpath = path.join(projectPath, folderpath);
        fs.mkdirSync(fullfolderpath);
    }
    
    private parseProject(projectPath: string){
        let content = fs.readFileSync(projectPath, 'utf8');
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