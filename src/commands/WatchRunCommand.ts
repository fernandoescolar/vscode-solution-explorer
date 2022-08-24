import { ContextValues, TreeItem } from "@tree";
import { Action, Watch } from "@actions";
import { ActionCommand } from "@commands/base";

export class WatchRunCommand extends ActionCommand {
    constructor() {
        super('Watch');
    }

    protected shouldRun(item: TreeItem): boolean {
        return item && (item.contextValue === ContextValues.project + '-cps' || item.contextValue === ContextValues.solution + '-cps');
    }

    protected async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.path) { return []; }

        return [ new Watch(item.path) ];
    }
}
