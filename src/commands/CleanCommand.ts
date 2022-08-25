import { ContextValues, TreeItem } from "@tree";
import { Action, Clean } from "@actions";
import { ActionsCommand } from "@commands";

export class CleanCommand extends ActionsCommand {
    constructor() {
        super('Clean');
    }

    public  shouldRun(item: TreeItem): boolean {
        return item && (item.contextValue === ContextValues.project + '-cps' || item.contextValue === ContextValues.solution + '-cps');
    }

    public async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.path) { return []; }

        return [ new Clean(item.path) ];
    }
}
