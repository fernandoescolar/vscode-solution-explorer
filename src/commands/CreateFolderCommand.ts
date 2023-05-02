import * as path from "@extensions/path";
import * as dialogs from "@extensions/dialogs";
import { TreeItem, ContextValues } from "@tree";
import { Action, CreateProjectFolder } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class CreateFolderCommand extends SingleItemActionsCommand {
    constructor() {
        super('Create folder');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return !!item && !!item.project;
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
        if (!item || !item.project || !item.path) { return []; }

        const folderName = await dialogs.getText('New folder name');
        if (!folderName) {
            return [];
        }

        let targetpath: string = item.path;
        if (!ContextValues.matchAnyLanguage(ContextValues.projectFolder, item.contextValue)) {
            targetpath = path.dirname(targetpath);
        }

        const folderpath = path.join(targetpath, folderName);
        return [ new CreateProjectFolder(item.project, folderpath) ];
    }
}
