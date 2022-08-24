import { ContextValues, TreeItem } from "@tree";
import { Action, Publish } from "@actions";
import { ActionCommand } from "@commands/base";

export class PublishCommand extends ActionCommand {
    constructor() {
        super('Publish');
    }

    protected shouldRun(item: TreeItem): boolean {
        return item && (item.contextValue === ContextValues.project + '-cps' || item.contextValue === ContextValues.solution + '-cps');
    }

    protected async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.path) { return []; }

        return [ new Publish(item.path) ];
    }
}
