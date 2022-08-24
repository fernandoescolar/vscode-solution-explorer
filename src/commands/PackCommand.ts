import { ContextValues, TreeItem } from "@tree";
import { Action, Pack } from "@actions";
import { ActionCommand } from "@commands/base";

export class PackCommand extends ActionCommand {
    constructor() {
        super('Pack');
    }

    protected shouldRun(item: TreeItem): boolean {
        return item && (item.contextValue === ContextValues.project + '-cps' || item.contextValue === ContextValues.solution + '-cps');
    }

    protected async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.path) { return []; }

        return [ new Pack(item.path) ];
    }
}
