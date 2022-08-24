import { ContextValues, TreeItem } from "@tree";
import { Action, Clean } from "@actions";
import { ActionCommand } from "@commands/base";

export class CleanCommand extends ActionCommand {
    constructor() {
        super('Clean');
    }

    protected shouldRun(item: TreeItem): boolean {
        return item && (item.contextValue === ContextValues.project + '-cps' || item.contextValue === ContextValues.solution + '-cps');
    }

    protected async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.path) { return []; }

        return [ new Clean(item.path) ];
    }
}
