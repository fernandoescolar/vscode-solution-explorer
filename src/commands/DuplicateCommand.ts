import * as path from "path";
import * as fs from "../async/fs";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem, ContextValues } from "../tree";
import { CommandBase } from "./base/CommandBase";

export class DuplicateCommand extends CommandBase {
    
    constructor(private readonly provider: SolutionExplorerProvider) {
        super();
    }

    protected shouldRun(item: TreeItem): boolean {
        if (item && item.path) return true;
        return false;
    }

    protected async runCommand(item: TreeItem, args: string[]): Promise<void> {    
        try {
            let ext = path.extname(item.path);
            let filename = path.basename(item.path, ext);
            filename = filename + '.1' + ext;

            let folder = path.dirname(item.path);           
            let content = await fs.readFile(item.path, "utf8");
            let filepath = await item.project.createFile(folder, filename, content);
            this.provider.logger.log("File duplicated: " + filepath);
        } catch(ex) {
            this.provider.logger.error('Can not duplicate file: ' + ex);
        }    
    }
}