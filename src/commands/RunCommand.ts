import { ContextValues, TreeItem } from "@tree";
import { Action, Run } from "@actions";
import { ActionCommand } from "@commands/base";

export class RunCommand extends ActionCommand {
    constructor() {
        super('Run');
    }

    protected shouldRun(item: TreeItem): boolean {
        return item && (item.contextValue === ContextValues.project + '-cps' || item.contextValue === ContextValues.solution + '-cps');
    }

    protected async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.path) { return []; }

        return [ new Run(item.path) ];
    }
}
