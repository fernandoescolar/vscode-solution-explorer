import * as dialogs from "@extensions/dialogs";
import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { ContextValues, TreeItem } from "@tree";
import { Action, SlnRenameProject, RenameSolution, SlnRenameSolutionFolder, SlnxRenameSolutionFolder } from "@actions";
import { SingleItemActionsCommand } from "@commands";
import { SolutionType, SolutionFolder } from "@core/Solutions";

export class RenameSolutionItemCommand extends SingleItemActionsCommand {
    constructor(private readonly provider: SolutionExplorerProvider) {
        super('Rename');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return !!item && !!item.solution;
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
        if (!item) { return []; }

        const newname = await dialogs.getText('New name', 'New name', item.label);
        if (!newname) { return []; }

        if (item.contextValue === ContextValues.solution || item.contextValue === ContextValues.solution + '-cps') {
            return [ new RenameSolution(item.solution.fullPath, newname) ];
        }

        if (item.solution.type === SolutionType.Sln && item.solutionItem && item.project) {
            return [ new SlnRenameProject(item.solution, item.project, item.label, newname) ];
        }

        if (item.solution.type === SolutionType.Sln && item.solutionItem instanceof SolutionFolder) {
            return [ new SlnRenameSolutionFolder(item.solution, item.label, newname) ];
        }

        if (item.solution.type === SolutionType.Slnx && item.solutionItem instanceof SolutionFolder) {
            return [ new SlnxRenameSolutionFolder(item.solution, item.label, newname) ];
        }

        return [];
    }
}
