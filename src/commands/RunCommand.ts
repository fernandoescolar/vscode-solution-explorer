import { ContextValues, TreeItem } from "@tree";
import { Action, DotNetRun } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class RunCommand extends SingleItemActionsCommand {
    constructor() {
        super('Run');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return !!item && (item.contextValue === ContextValues.project + '-cps' || item.contextValue === ContextValues.solution + '-cps');
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
        if (!item || !item.path) { return []; }

        return [ new DotNetRun(item.path) ];
    }
}
