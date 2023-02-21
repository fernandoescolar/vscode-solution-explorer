import * as dialogs from "@extensions/dialogs";
import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { ContextValues, TreeItem } from "@tree";
import { ProjectInSolution } from "@core/Solutions";
import { Action, RenameProject, RenameSolution, RenameSolutionFolder } from "@actions";
import { SingleItemActionsCommand } from "@commands";

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

        if (item.projectInSolution && item.project) {
            return [ new RenameProject(item.solution, item.project, item.label, newname) ];
        }

        if (item.projectInSolution) {
            return [ new RenameSolutionFolder(item.solution, item.label, newname) ];
        }

        return [];
    }
}
