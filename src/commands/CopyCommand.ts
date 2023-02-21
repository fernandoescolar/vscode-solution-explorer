import { TreeItem } from "@tree";
import { Action, Copy } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class CopyCommand extends SingleItemActionsCommand {
    constructor() {
        super('Copy');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return !!item && !!item.path;
    }

    public getActions(item: TreeItem | undefined): Promise<Action[]> {
        if(!item || !item.path) { return Promise.resolve([]); }

        return Promise.resolve([new Copy(item.path)]);
    }
}
