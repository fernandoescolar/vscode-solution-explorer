import { ContextValues, TreeItem } from "@tree";
import { Action, SlnMoveProject } from "@actions";
import { DropHandler } from "./DropHandler";
import { SolutionType } from "@core/Solutions";

export class MoveSolutionFolderInTheSameSolution extends DropHandler {
    public async canHandle(source: TreeItem, target: TreeItem): Promise<boolean> {
        return this.isSolutionFolder(source) && this.isValidTarget(target);
    }

    public async handle(source: TreeItem, target: TreeItem): Promise<Action[]> {
        if (!target.solutionItem) { return []; }

        const targetpath = this.isSolution(target) ? 'root' :
            this.isProject(target) ? target.solutionItem.id || 'root' :
                this.isSolutionFolder(target) ? target.solutionItem.id :
                    undefined;

        if (!target.solution || !source.solutionItem || targetpath === undefined) { return []; }

        if (target.solution.type === SolutionType.Sln) {
            return [new SlnMoveProject(target.solution, source.solutionItem, targetpath)];
        }

        return [];
    }

    protected isProject(item: TreeItem): boolean {
        return !!item.project && !!item.solutionItem;
    }

    protected isSolutionFolder(item: TreeItem): boolean {
        return !item.project && !!item.solutionItem;
    }

    protected isSolution(item: TreeItem): boolean {
        return ContextValues.matchAnyLanguage(ContextValues.solution, item.contextValue) && !item.solutionItem;
    }

    protected isValidTarget(item: TreeItem): boolean {
        return this.isProject(item) || this.isSolutionFolder(item) || this.isSolution(item);
    }
}
