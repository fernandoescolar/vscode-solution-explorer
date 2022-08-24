import { ContextValues, TreeItem } from "@tree";
import { Action, Test } from "@actions";
import { ActionCommand } from "@commands/base";

export class TestCommand extends ActionCommand {
    constructor() {
        super('Test');
    }

    protected shouldRun(item: TreeItem): boolean {
        return item && (item.contextValue === ContextValues.project + '-cps' || item.contextValue === ContextValues.solution + '-cps');
    }

    protected async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.path) { return []; }

        return [ new Test(item.path) ];
    }
}
