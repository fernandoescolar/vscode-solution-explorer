import { ContextValues, TreeItem } from "@tree";
import { Action, DotNetRestore } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class RestoreCommand extends SingleItemActionsCommand {
    constructor() {
        super('Restore');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return !!item && (item.contextValue === ContextValues.project + '-cps' || item.contextValue === ContextValues.solution + '-cps');
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
        if (!item || !item.path) { return []; }

        return [ new DotNetRestore(item.path) ];
    }
}
