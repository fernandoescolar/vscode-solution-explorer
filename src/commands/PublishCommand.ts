import { ContextValues, TreeItem } from "@tree";
import { Action, DotNetPublish } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class PublishCommand extends SingleItemActionsCommand {
    constructor() {
        super('Publish');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return !!item && (item.contextValue === ContextValues.project + '-cps' || item.contextValue === ContextValues.solution + '-cps');
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
        if (!item || !item.path) { return []; }

        return [ new DotNetPublish(item.path) ];
    }
}
