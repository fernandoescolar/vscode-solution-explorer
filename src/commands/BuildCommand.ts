import { ContextValues, TreeItem } from "@tree";
import { Action, DotNetBuild } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class BuildCommand extends SingleItemActionsCommand {
    constructor() {
        super('Build');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return !!item && (item.contextValue === ContextValues.project + '-cps' || item.contextValue === ContextValues.solution + '-cps');
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
        if (!item || !item.path) { return []; }

        return [ new DotNetBuild(item.path) ];
    }
}
