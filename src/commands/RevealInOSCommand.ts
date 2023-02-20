import { ContextValues, TreeItem } from "@tree";
import { Action, RevealInOS } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class RevealInOSCommand extends SingleItemActionsCommand {
    constructor() {
        super('Restore');
    }

    public  shouldRun(item: TreeItem): boolean {
        return item && item.contextValue === ContextValues.projectFile;
    }

    public async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.path) { return []; }

        return [ new RevealInOS(item.path) ];
    }
}