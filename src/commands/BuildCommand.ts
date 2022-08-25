import { ContextValues, TreeItem } from "@tree";
import { Action, Build } from "@actions";
import { ActionsCommand } from "@commands";

export class BuildCommand extends ActionsCommand {
    constructor() {
        super('Build');
    }

    public  shouldRun(item: TreeItem): boolean {
        return item && (item.contextValue === ContextValues.project + '-cps' || item.contextValue === ContextValues.solution + '-cps');
    }

    public async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.path) { return []; }

        return [ new Build(item.path) ];
    }
}
