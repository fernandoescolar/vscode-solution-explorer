import * as dialogs from "@extensions/dialogs";
import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem, ContextValues } from "@tree";
import { Action, MoveProjectFile, MoveProjectFolder } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class MoveCommand extends SingleItemActionsCommand {
    constructor(private readonly provider: SolutionExplorerProvider) {
        super('Move');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return !!item && !!item.project && !!item.path
            && (ContextValues.matchAnyLanguage(ContextValues.projectFile, item.contextValue)
                || ContextValues.matchAnyLanguage(ContextValues.projectFolder, item.contextValue));
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
        if (!item || !item.project || !item.path) { return []; }

        const folders = await item.project?.getFolderList() ?? [];
        const folder = await dialogs.selectOption('Select folder...', folders);
        if (!folder) { return []; }

        if (ContextValues.matchAnyLanguage(ContextValues.projectFile, item.contextValue)) {
            return [new MoveProjectFile(item.project, item.path, folder)];
        } else if (ContextValues.matchAnyLanguage(ContextValues.projectFolder, item.contextValue)) {
            return [new MoveProjectFolder(item.project, item.path, folder)];
        } else {
            return [];
        }
    }
}
