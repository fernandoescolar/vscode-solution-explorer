import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import * as clipboard from "@extensions/clipboard";
import { createCopyName } from "@core/Utilities";
import { Project } from "@core/Projects";
import { Action, ActionContext } from "./base/Action";

export class Paste implements Action {
    constructor(private readonly project: Project, private readonly targetPath: string) {
    }

    public toString(): string {
        return `Paste`;
    }

    public async execute(context: ActionContext): Promise<void> {
        const data = await clipboard.readText();
        if (!data) { return; }

        if (!(await fs.exists(data))) { return; }

        const isDirectory = await fs.isDirectory(data);
        if (isDirectory) {
            this.copyDirectory(data, this.targetPath);
        } else {
            this.copyFile(data, this.targetPath);
        }
    }

    private async copyDirectory(sourcepath: string, targetpath: string): Promise<void> {
        let items = await this.getFilesToCopyFromDirectory(sourcepath, targetpath);
        let keys = Object.keys(items).sort((a, b) => a.length > b.length ? 1 : -1);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let isDirectory = await fs.isDirectory(key);
            if (isDirectory) {
                await fs.mkdir(items[key]);
            } else {
                this.copyFile(key, path.dirname(items[key]));
            }
        }
    }

    private async copyFile(sourcepath: string, targetpath: string): Promise<void> {
        let filename = path.basename(sourcepath);
        let filepath = path.join(targetpath, filename);
        filepath = await createCopyName(filepath);
        filename = path.basename(filepath);

        let content = await fs.readFile(sourcepath);
        filepath = await this.project.createFile(targetpath, filename, content);
    }

    private async getFilesToCopyFromDirectory(sourcepath: string, targetpath: string): Promise<{ [id: string]: string; }> {
        let result: { [id: string]: string; } = {};
        targetpath = path.join(targetpath, path.basename(sourcepath));
        targetpath = await createCopyName(targetpath);

        result[sourcepath] = targetpath;

        let items = await fs.readdir(sourcepath);
        for (let i = 0; i < items.length; i++) {
            let filename = path.join(sourcepath, items[i]);
            let isDirectory = await fs.isDirectory(filename);
            if (isDirectory) {
                result = Object.assign(await this.getFilesToCopyFromDirectory(filename, targetpath), result);
            } else {
                result[filename] = path.join(targetpath, items[i]);
            }
        }

        return result;
    }
}
