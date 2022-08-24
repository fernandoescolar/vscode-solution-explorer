import { TreeItem } from "@tree";
import { Action, Copy } from "@actions";
import { ActionCommand } from "@commands/base";

export class CopyCommand extends ActionCommand {
    constructor() {
        super('Copy');
    }

    protected shouldRun(item: TreeItem): boolean {
        return !!item && !!item.path;
    }

    protected getActions(item: TreeItem): Promise<Action[]> {
        if(!item.path) { return Promise.resolve([]); }

        return Promise.resolve([new Copy(item.path)]);
    }
}
