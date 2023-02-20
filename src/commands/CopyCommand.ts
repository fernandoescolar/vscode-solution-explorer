import { TreeItem } from "@tree";
import { Action, Copy } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class CopyCommand extends SingleItemActionsCommand {
    constructor() {
        super('Copy');
    }

    public shouldRun(item: TreeItem): boolean {
        return !!item && !!item.path;
    }

    public getActions(item: TreeItem): Promise<Action[]> {
        if(!item.path) { return Promise.resolve([]); }

        return Promise.resolve([new Copy(item.path)]);
    }
}
