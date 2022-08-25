import * as path from "@extensions/path";
import * as dialogs from "@extensions/dialogs";
import { TreeItem, ContextValues } from "@tree";
import { Action, CreateProjectFolder } from "@actions";
import { ActionsCommand } from "@commands";

export class CreateFolderCommand extends ActionsCommand {
    constructor() {
        super('Create folder');
    }

    public  shouldRun(item: TreeItem): boolean {
        return !!item.project;
    }

    public async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.project || !item.path) { return []; }

        const folderName = await dialogs.getText('New folder name');
        if (!folderName) {
            return [];
        }

        let targetpath: string = item.path;
        if (!item.contextValue.startsWith(ContextValues.projectFolder)) {
            targetpath = path.dirname(targetpath);
        }

        const folderpath = path.join(targetpath, folderName);
        return [ new CreateProjectFolder(item.project, folderpath) ];
    }
}
