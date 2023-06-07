import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem, ContextValues } from "@tree";
import { Action } from "@actions";
import { SingleItemActionsCommand } from "@commands";
import { MoveProjectFileUp } from "@actions";

export class MoveFileUpCommand extends SingleItemActionsCommand {
    constructor(private readonly provider: SolutionExplorerProvider) {
        super('MoveFileUp');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return !!item && !!item.project && item.project.extension.toLocaleLowerCase() === 'fsproj' && !!item.path 
        && (ContextValues.matchAnyLanguage(ContextValues.projectFile, item.contextValue) || ContextValues.matchAnyLanguage(ContextValues.projectFolder, item.contextValue));
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
        if (!item || !item.project || !item.path) { return []; }

        return [new MoveProjectFileUp(item.project, item.path)];
    }
}
