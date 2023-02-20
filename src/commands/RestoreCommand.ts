import { ContextValues, TreeItem } from "@tree";
import { Action, Restore } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class RestoreCommand extends SingleItemActionsCommand {
    constructor() {
        super('Restore');
    }

    public shouldRun(item: TreeItem): boolean {
        return item && (item.contextValue === ContextValues.project + '-cps' || item.contextValue === ContextValues.solution + '-cps');
    }

    public async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.path) { return []; }

        return [ new Restore(item.path) ];
    }
}
