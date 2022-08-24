import { ContextValues, TreeItem } from "@tree";
import { Action, Build } from "@actions";
import { ActionCommand } from "@commands/base";

export class BuildCommand extends ActionCommand {
    constructor() {
        super('Build');
    }

    protected shouldRun(item: TreeItem): boolean {
        return item && (item.contextValue === ContextValues.project + '-cps' || item.contextValue === ContextValues.solution + '-cps');
    }

    protected async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.path) { return []; }

        return [ new Build(item.path) ];
    }
}
