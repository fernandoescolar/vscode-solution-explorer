import * as fs from "@extensions/fs";
import { TreeItem } from "@tree";
import { Action, OpenFile } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class OpenFileAndFocusCommand extends SingleItemActionsCommand {
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

        return [new OpenFile(item.path, false, true)];
    }
}
