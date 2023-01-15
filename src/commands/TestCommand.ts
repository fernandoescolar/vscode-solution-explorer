import { ContextValues, TreeItem } from "@tree";
import { Action, Test } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class TestCommand extends SingleItemActionsCommand {
    constructor() {
        super('Test');
    }

    public  shouldRun(item: TreeItem): boolean {
        return item && (item.contextValue === ContextValues.project + '-cps' || item.contextValue === ContextValues.solution + '-cps');
    }

    public async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.path) { return []; }

        return [ new Test(item.path) ];
    }
}
