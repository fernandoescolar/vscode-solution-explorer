import { ContextValues, TreeItem } from "@tree";
import { Action, RevealInOS } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class RevealInOSCommand extends SingleItemActionsCommand {
    constructor() {
        super('Restore');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return !!item && item.contextValue.startsWith(ContextValues.projectFile);
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
        if (!item || !item.path) { return []; }

        return [ new RevealInOS(item.path) ];
    }
}