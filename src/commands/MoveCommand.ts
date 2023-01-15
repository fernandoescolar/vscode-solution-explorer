import * as dialogs from "@extensions/dialogs";
import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem, ContextValues } from "@tree";
import { Action, MoveProjectFile, MoveProjectFolder } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class MoveCommand extends SingleItemActionsCommand {
    constructor(private readonly provider: SolutionExplorerProvider) {
        super('Move');
    }

    public  shouldRun(item: TreeItem): boolean {
       return !!item && !!item.project && !!item.path && ( item.contextValue.startsWith(ContextValues.projectFile) || item.contextValue.startsWith(ContextValues.projectFolder) );
    }

    public async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.project || !item.path) { return []; }

        const folders = await item.project?.getFolderList() ?? [];
        const folder = await dialogs.selectOption('Select folder...', folders);
        if (!folder) { return []; }

        if (item.contextValue.startsWith(ContextValues.projectFile)) {
            return [ new MoveProjectFile(item.project, item.path, folder) ];
        } else if (item.contextValue.startsWith(ContextValues.projectFolder)) {
            return [ new MoveProjectFolder(item.project, item.path, folder) ];
        } else {
            return [];
        }
    }
}
