import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import * as Utilities from "../../Utilities";
import { ProjectInSolution } from "../../Solutions";
import { Project, ProjectFileStat } from "../Project";
import { ProjectFile } from "../ProjectFile";
import { ProjectFolder } from "../ProjectFolder";

export abstract class FileSystemBasedProject extends Project {
    constructor(projectInSolution: ProjectInSolution, type: string) {
        super(projectInSolution, type);
    }

    public get projectFolderPath(): string {
        return path.dirname(this.projectInSolution.fullPath);
    }

    public async getProjectFilesAndFolders(virtualPath?: string): Promise<{ files: ProjectFile[], folders: ProjectFolder[] }> {
        let folderPath = path.dirname(this.projectInSolution.fullPath);
        if (virtualPath) {
            folderPath = path.join(folderPath, virtualPath);
        }

        let result = await Utilities.getDirectoryItems(folderPath);
        let files: ProjectFile[] = [];
        let folders: ProjectFolder[] = [];

        result.files.forEach(filepath => files.push(new ProjectFile(filepath)));
        result.directories.forEach(folderpath => folders.push(new ProjectFolder(folderpath)));

        return { files, folders };
    }

    public renameFile(filepath: string, name: string): Promise<string> {
        return this.renameItem(filepath, name);
    }

    public async deleteFile(filepath: string): Promise<void> {
        if (await fs.exists(filepath)) {
            await fs.unlink(filepath);
        }
    }

    public async createFile(folderpath: string, filename: string, content?: string): Promise<string> {
        let filepath = path.join(folderpath, filename);
        if (!(await fs.exists(filepath))) {
            await fs.writeFile(filepath, content || "");
        }

        return filepath;
    }

    public renameFolder(folderpath: string, name: string): Promise<string> {
        return this.renameItem(folderpath, name);
    }

    public deleteFolder(folderpath: string): Promise<void> {
        return fs.rmdirRecursive(folderpath);
    }

    public async createFolder(folderpath: string): Promise<string> {
        await fs.mkdir(folderpath);
        return folderpath;
    }

    public async getFolderList(): Promise<string[]> {
        const directories = await Utilities.getAllDirectoriesRecursive(this.projectFolderPath);
        const result: string[] = [ '.' + path.sep ];
        directories.forEach(dirPath => result.push('.' + dirPath.replace(this.projectFolderPath, '')));
        return result;
    }

    public async statFile(filepath: string, folderPath: string): Promise<ProjectFileStat> {
        const filename = filepath.split(path.sep).pop() || "";
        const fullpath = this.getPathInProject(filename, folderPath);
        const exists = await fs.exists(fullpath);
        return {
            exists,
            filename,
            fullpath
        };
    }

    public moveFile(filepath: string, newfolderPath: string): Promise<string> {
        return this.moveItem(filepath, newfolderPath);
    }

    public moveFolder(folderpath: string, newfolderPath: string): Promise<string> {
        return this.moveItem(folderpath, newfolderPath);
    }

    private async moveItem(itemPath: string, newfolderPath: string): Promise<string> {
        const newItemPath = this.getPathInProject(itemPath, newfolderPath);
        await fs.rename(itemPath, newItemPath);
        return newItemPath;
    }

    private async renameItem(itemPath: string, name: string): Promise<string> {
        const folder = path.dirname(itemPath);
        const newItempath = path.join(folder, name);
        await fs.rename(itemPath, newItempath);
        return newItempath;
    }

    private getPathInProject(filepath: string, folderPath: string): string {
        const fullFolderPath = path.join(this.projectFolderPath, folderPath);
        const fileName = filepath.split(path.sep).pop() || "";
        return path.join(fullFolderPath, fileName);
    }
}