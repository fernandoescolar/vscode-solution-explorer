import { ContextValues, TreeItem } from "@tree";
import { Action, DotNetWatch } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class WatchRunCommand extends SingleItemActionsCommand {
    constructor() {
        super('Watch');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return !!item && (item.contextValue === ContextValues.project + '-cps' || item.contextValue === ContextValues.solution + '-cps');
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
        if (!item || !item.path) { return []; }

        return [ new DotNetWatch(item.path) ];
    }
}
