import * as path from "path";
import * as fs from "../../../async/fs";
import * as Utilities from "../../Utilities";
import { ProjectInSolution } from "../../Solutions";
import { Project } from "../Project";
import { ProjectFile } from "../ProjectFile";
import { ProjectFolder } from "../ProjectFolder";

export abstract class FileSystemBasedProject extends Project {
    constructor(projectInSolution: ProjectInSolution, type: string) {
        super(projectInSolution, type);
    }

    public async getProjectFilesAndFolders(virtualPath?: string): Promise<{ files: ProjectFile[], folders: ProjectFolder[] }> {
        let folderPath = path.dirname(this.projectInSolution.fullPath);
        if (virtualPath)
            folderPath = path.join(folderPath, virtualPath);
        
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
        return fs.rmdir_recursive(folderpath);
    }

    public async createFolder(folderpath: string): Promise<string> {
        await fs.mkdir(folderpath);
        return folderpath;
    }

    public async getFolderList(): Promise<string[]> {
        let folderPath = path.dirname(this.projectInSolution.fullPath);
        let directories = await Utilities.getAllDirectoriesRecursive(folderPath);
        let result: string[] = [ '.' + path.sep ];
        directories.forEach(dirPath => result.push('.' + dirPath.replace(folderPath, '')));
        return result;
    }

    public moveFile(filepath: string, newfolderPath: string): Promise<string> {
        return this.moveItem(filepath, newfolderPath);
    }

    public moveFolder(folderpath: string, newfolderPath: string): Promise<string> {
        return this.moveItem(folderpath, newfolderPath);
    }

    private async moveItem(itemPath: string, newfolderPath: string): Promise<string> {
        let folderPath = path.dirname(this.projectInSolution.fullPath);
        let fullFolderPath = path.join(folderPath, newfolderPath);
        let itemName = itemPath.split(path.sep).pop();
        let newItemPath = path.join(fullFolderPath, itemName);
        await fs.rename(itemPath, newItemPath);
        return newItemPath;
    }

    private async renameItem(itemPath: string, name: string): Promise<string> {
        let folder = path.dirname(itemPath);
        let newItempath = path.join(folder, name);
        await fs.rename(itemPath, newItempath);
        return newItempath;
    }
}