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

    public async renameFile(filepath: string, name: string): Promise<string> {
        let folder = path.dirname(filepath);
        let newFilepath = path.join(folder, name);
        await fs.rename(filepath, newFilepath);
        return newFilepath;
    }

    public async deleteFile(filepath: string): Promise<void> {
        if (await fs.exists(filepath)) {
            await fs.unlink(filepath);
        }
    }

    public async createFile(folderpath: string, filename: string): Promise<string> {
        let filepath = path.join(folderpath, filename);
        if (!(await fs.exists(filepath))) {
            await fs.writeFile(filepath, "");
        }

        return filepath;
    }

    public async renameFolder(folderpath: string, name: string): Promise<string> {
        let newfolderpath = path.join(path.dirname(folderpath), name);
        await fs.rename(folderpath, newfolderpath);
        return newfolderpath;
    }

    public deleteFolder(folderpath: string): Promise<void> {
        return fs.rmdir(folderpath);
    }

    public async createFolder(folderpath: string): Promise<string> {
        await fs.mkdir(folderpath);
        return folderpath;
    }
}