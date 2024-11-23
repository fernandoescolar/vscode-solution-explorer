import { ContextValues, TreeItem } from "@tree";
import { Action, DotNetClean } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class CleanCommand extends SingleItemActionsCommand {
    constructor() {
        super('Clean');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return !!item && (item.contextValue === ContextValues.project + '-cps' || item.contextValue === ContextValues.solution + '-cps');
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
        if (!item || !item.path) { return []; }

        return [ new DotNetClean(item.path) ];
    }
}
