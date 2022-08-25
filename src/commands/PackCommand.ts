import { ContextValues, TreeItem } from "@tree";
import { Action, Pack } from "@actions";
import { ActionsCommand } from "@commands";

export class PackCommand extends ActionsCommand {
    constructor() {
        super('Pack');
    }

    public  shouldRun(item: TreeItem): boolean {
        return item && (item.contextValue === ContextValues.project + '-cps' || item.contextValue === ContextValues.solution + '-cps');
    }

    public async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.path) { return []; }

        return [ new Pack(item.path) ];
    }
}
