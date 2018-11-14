import * as fs from "../async/fs";
import * as path from "path";
import * as clipboardy from "clipboardy";
import * as Utilities from "../model/Utilities";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem, ContextValues } from "../tree";
import { CommandBase } from "./base/CommandBase";

export class PasteCommand extends CommandBase {
    
    constructor(private readonly provider: SolutionExplorerProvider) {
        super('Paste');
    }

    protected shouldRun(item: TreeItem): boolean {
        if (item && item.path) return true;
        return false;
    }

    protected async runCommand(item: TreeItem, args: string[]): Promise<void> {    
        let data = await clipboardy.read();
        if (!data) return;     
        
        if (!(await fs.exists(data))) return;

        let targetpath: string = item.path;
        if (!item.contextValue.startsWith(ContextValues.ProjectFolder)){
            targetpath = path.dirname(targetpath);
        }

        let stat = await fs.lstat(data);
        if (stat.isDirectory()){
            this.copyDirectory(item, data, targetpath);
        } else {
            this.copyFile(item, data, targetpath);
        }
    }

    private async copyDirectory(item: TreeItem, sourcepath: string, targetpath: string): Promise<void> {
        let items = await this.getFilesToCopyFromDirectory(sourcepath, targetpath);
        let keys = Object.keys(items).sort((a, b) => a.length > b.length ? 1 : -1 );
        for(let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let stat = await fs.lstat(key);
            if (stat.isDirectory()){
                await fs.mkdir(items[key]);
            } else {
                this.copyFile(item, key, path.dirname(items[key]));
            }
        }
    }

    private async copyFile(item: TreeItem, sourcepath: string, targetpath: string): Promise<void> {
        try {
            let filename = path.basename(sourcepath);            
            let filepath = path.join(targetpath, filename);
            filepath = await Utilities.createCopyName(filepath);
            filename = path.basename(filepath);
            
            let content = await fs.readFile(sourcepath, "utf8");
            filepath = await item.project.createFile(targetpath, filename, content);
            this.provider.logger.log("File copied: " + sourcepath + ' -> ' + filepath);
        } catch(ex) {
            this.provider.logger.error('Can not copy file: ' + ex);
        }    
    }

    private async getFilesToCopyFromDirectory(sourcepath: string, targetpath: string): Promise<{[id: string]: string}> {
        let result: {[id: string]: string} = {};
        targetpath = path.join(targetpath, path.basename(sourcepath));
        targetpath = await Utilities.createCopyName(targetpath);

        result[sourcepath] = targetpath;

        let items = await fs.readdir(sourcepath);
        for(let i = 0; i < items.length; i++){
            let filename = path.join(sourcepath, items[i]);
            let stat = await fs.lstat(filename);
            if (stat.isDirectory()){
                result = Object.assign(await this.getFilesToCopyFromDirectory(filename, targetpath), result);
            } else {
                result[filename] = path.join(targetpath, items[i]);
            }
        }

        return result;
    }
}