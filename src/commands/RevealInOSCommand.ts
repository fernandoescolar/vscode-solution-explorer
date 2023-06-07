import { ContextValues, TreeItem } from "@tree";
import { Action, RevealInOS } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class RevealInOSCommand extends SingleItemActionsCommand {
    constructor() {
        super('Restore');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return !!item && ContextValues.matchAnyLanguage(ContextValues.projectFile, item.contextValue);
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
        if (!item || !item.path) { return []; }

        return [ new RevealInOS(item.path) ];
    }
}