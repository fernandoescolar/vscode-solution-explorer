import * as fs from "../../async/fs";
import * as path from "path";
import { Project } from "./Project";
import { ProjectInSolution } from "../Solutions";
import * as Utilities from "../Utilities";

export abstract class FileSystemBasedProject extends Project {
    constructor(projectInSolution: ProjectInSolution) {
        super(projectInSolution);
    }

    public async getProjectFilesAndFolders(virtualPath?: string): Promise<{ files: string[], folders: string[] }> {
        let folderPath = path.dirname(this.projectInSolution.FullPath);
        if (virtualPath)
            folderPath = path.join(folderPath, virtualPath);
        
        let result = await Utilities.getDirectoryItems(folderPath);
        return {
            files: result.Files,
            folders: result.Directories
        };
    }

    public async renameFile(filepath: string, name: string): Promise<void> {
        let folder = path.dirname(filepath);
        let newFilepath = path.join(folder, name);
        await fs.rename(filepath, newFilepath);
    }

    public async deleteFile(filepath: string): Promise<void> {
        if (await fs.exists(filepath)) {
            await fs.unlink(filepath);
        }
    }

    public async createFile(folderpath: string, filename: string): Promise<string> {
        let projectPath = path.dirname(this.FullPath);
        let filepath = path.join(projectPath, folderpath, filename);
        if (!(await fs.exists(filepath))) {
            await fs.writeFile(filepath, "");
        }

        return filepath;
    }

    public async renameFolder(folderpath: string, name: string): Promise<void> {
        let projectPath = path.dirname(this.FullPath);
        let fullfolderpath = path.join(projectPath, folderpath);
        let newfolderpath = path.join(path.dirname(fullfolderpath), name);
        await fs.rename(fullfolderpath, newfolderpath);
    }

    public async deleteFolder(folderpath: string): Promise<void> {
        let projectPath = path.dirname(this.FullPath);
        let fullfolderpath = path.join(projectPath, folderpath);
        await fs.rmdir(fullfolderpath);
    }

    public async createFolder(folderpath: string): Promise<void> {
        let projectPath = path.dirname(this.FullPath);
        let fullfolderpath = path.join(projectPath, folderpath);
        await fs.mkdir(fullfolderpath);
    }
}