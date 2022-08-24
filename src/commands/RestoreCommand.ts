import { ContextValues, TreeItem } from "@tree";
import { Action, Restore } from "@actions";
import { ActionCommand } from "@commands/base";

export class RestoreCommand extends ActionCommand {
    constructor() {
        super('Restore');
    }

    protected shouldRun(item: TreeItem): boolean {
        return item && (item.contextValue === ContextValues.project + '-cps' || item.contextValue === ContextValues.solution + '-cps');
    }

    protected async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.path) { return []; }

        return [ new Restore(item.path) ];
    }
}
