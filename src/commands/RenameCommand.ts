import * as dialogs from "@extensions/dialogs";
import { TreeItem, ContextValues } from "@tree";
import { Action, RenameProjectFile, RenameProjectFolder } from "@actions";
import { ActionsCommand } from "@commands";

export class RenameCommand extends ActionsCommand {
    constructor() {
        super('Rename');
    }

    public  shouldRun(item: TreeItem): boolean {
        return !!item.project && !!item.path;
    }

    public async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.project || !item.path) { return []; }

        const oldname = item.label;
        const newname = await dialogs.getText('New name', 'New name', item.label);
        if (!newname) { return []; }

        if (item.contextValue.startsWith(ContextValues.projectFile)) {
            return [ new RenameProjectFile(item.project, item.path, newname) ];

        } else if (item.contextValue.startsWith(ContextValues.projectFolder)) {
            return [ new RenameProjectFolder(item.project, item.path, oldname, newname) ];
        }

        return [];
    }
}
