import { ContextValues, TreeItem } from "@tree";
import { Action, SlnMoveSolutionFolder, SlnxMoveSolutionFolder } from "@actions";
import { DropHandler } from "./DropHandler";
import { SolutionType, SolutionFolder } from "@core/Solutions";

export class MoveSolutionFolderInTheSameSolution extends DropHandler {
    public async canHandle(source: TreeItem, target: TreeItem): Promise<boolean> {
        return this.isSolutionFolder(source) && this.isValidTarget(target);
    }

    public async handle(source: TreeItem, target: TreeItem): Promise<Action[]> {
        const targetpath = this.isSolution(target) ? 'root' :
            this.isSolutionFolder(target) ? target.solutionItem?.id :
                this.isProject(target) ? (target.solutionItem?.parent as SolutionFolder)?.id :
                    undefined;
        if (!target.solution || !source.solutionItem || targetpath === undefined) { return []; }

        if (source.solutionItem instanceof SolutionFolder) {
            if (target.solution.type === SolutionType.Sln) {
                return [new SlnMoveSolutionFolder(target.solution, source.solutionItem, targetpath)];
            }

            if (target.solution.type === SolutionType.Slnx) {
                return [new SlnxMoveSolutionFolder(target.solution, source.solutionItem, targetpath)];
            }
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
