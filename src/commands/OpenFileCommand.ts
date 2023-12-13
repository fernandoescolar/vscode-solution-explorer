import * as fs from "@extensions/fs";
import { TreeItem } from "@tree";
import { Action, OpenFile } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class OpenFileCommand extends SingleItemActionsCommand {
    private lastOpenedFile: string | undefined;
    private lastOpenedDate: Date | undefined;

    constructor() {
        super('Open file');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return !!item && !!item.path;
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
        if (!item || !item.path) { return []; }
        if (!(await fs.exists(item.path))) {
            return [];
        }

        const preview = !this.checkDoubleClick(item);
        return [ new OpenFile(item.path, preview) ];
    }

    private checkDoubleClick(item: TreeItem): boolean {
        let result = false;
        if (this.lastOpenedFile && this.lastOpenedDate) {
            let isTheSameFile = this.lastOpenedFile === item.path;
            let dateDiff = <number>(<any>new Date() - <any>this.lastOpenedDate);
            result =  isTheSameFile && dateDiff < 500;
        }

        this.lastOpenedFile = item.path;
        this.lastOpenedDate = new Date();
        return result;
    }
}

