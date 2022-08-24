import * as dialogs from "@extensions/dialogs";
import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { ContextValues, TreeItem } from "@tree";
import { ProjectInSolution } from "@core/Solutions";
import { Action, RenameProject, RenameSolution, RenameSolutionFolder } from "@actions";
import { ActionCommand } from "@commands/base";

export class RenameSolutionItemCommand extends ActionCommand {
    constructor(private readonly provider: SolutionExplorerProvider) {
        super('Rename');
    }

    protected shouldRun(item: TreeItem): boolean {
        return !!item.solution;
    }

    protected async getActions(item: TreeItem): Promise<Action[]> {
        const newname = await dialogs.getText('New name', 'New name', item.label);
        if (!newname) { return []; }

        if (item.contextValue === ContextValues.solution || item.contextValue === ContextValues.solution + '-cps') {
            return [ new RenameSolution(item.solution.fullPath, newname) ];
        }

        const projectInSolution: ProjectInSolution = (<any>item).projectInSolution;
        if (projectInSolution && item.project) {
            return [ new RenameProject(item.solution, item.project, item.label, newname) ];
        }

        if (projectInSolution) {
            return [ new RenameSolutionFolder(item.solution, item.label, newname) ];
        }

        return [];
    }
}
