import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import { ProjectFileStat } from "../ProjectFileStat";
import { RelativeFilePosition } from "../RelativeFilePosition";

export class FileManager {
    private readonly projectFolderPath: string;

    constructor(protected readonly projectFullPath: string) {
        this.projectFolderPath = path.dirname(projectFullPath);
    }

    public renameFile(filepath: string, name: string): Promise<string> {
        return this.renameItem(filepath, name);
    }

    public async deleteFile(filepath: string): Promise<void> {
        if (await fs.exists(filepath)) {
            await fs.unlink(filepath);
        }
    }

    public async createFile(folderpath: string, filename: string, content?: string, relativePosition?:RelativeFilePosition): Promise<string> {
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

    public moveFileUp(filepath: string): Promise<string> {
        return Promise.resolve(filepath);
    }

    public moveFileDown(filepath: string): Promise<string> {
        return Promise.resolve(filepath);
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

        if (path.extname(newItempath) === '.cs') {
            let data = await fs.readFile(newItempath);
            await fs.writeFile(newItempath, data.replaceAll(path.basename(itemPath).split('.')[0], name.split('.')[0]));
        }

        return newItempath;
    }

    private getPathInProject(filepath: string, folderPath: string): string {
        const fullFolderPath = path.join(this.projectFolderPath, folderPath);
        const fileName = filepath.split(path.sep).pop() || "";
        return path.join(fullFolderPath, fileName);
    }
}
