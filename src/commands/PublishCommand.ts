import { ContextValues, TreeItem } from "@tree";
import { Action, Publish } from "@actions";
import { ActionsCommand } from "@commands";

export class PublishCommand extends ActionsCommand {
    constructor() {
        super('Publish');
    }

    public  shouldRun(item: TreeItem): boolean {
        return item && (item.contextValue === ContextValues.project + '-cps' || item.contextValue === ContextValues.solution + '-cps');
    }

    public async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.path) { return []; }

        return [ new Publish(item.path) ];
    }
}
