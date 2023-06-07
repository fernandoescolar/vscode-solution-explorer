import * as dialogs from "@extensions/dialogs";
import { TreeItem, ContextValues } from "@tree";
import { Action, RenameProjectFile, RenameProjectFolder } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class RenameCommand extends SingleItemActionsCommand {
    constructor() {
        super('Rename');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return !!item && !!item.project && !!item.path;
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
        if (!item || !item.project || !item.path) { return []; }

        const oldname = item.label;
        const newname = await dialogs.getText('New name', 'New name', item.label);
        if (!newname) { return []; }

        if (ContextValues.matchAnyLanguage(ContextValues.projectFile, item.contextValue)) {
            return [ new RenameProjectFile(item.project, item.path, newname) ];

        } else if (ContextValues.matchAnyLanguage(ContextValues.projectFolder, item.contextValue)) {
            return [ new RenameProjectFolder(item.project, item.path, oldname, newname) ];
        }

        return [];
    }
}
