import { ContextValues, TreeItem } from "@tree";
import { Action, DotNetPack } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class PackCommand extends SingleItemActionsCommand {
    constructor() {
        super('Pack');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return !!item && (item.contextValue === ContextValues.project + '-cps' || item.contextValue === ContextValues.solution + '-cps');
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
        if (!item || !item.path) { return []; }

        return [ new DotNetPack(item.path) ];
    }
}
