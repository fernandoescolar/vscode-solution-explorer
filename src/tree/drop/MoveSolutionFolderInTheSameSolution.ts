import { ContextValues, TreeItem } from "@tree";
import { Action, MoveProject } from "@actions";
import { DropHandler } from "./DropHandler";

export class MoveSolutionFolderInTheSameSolution extends DropHandler {
    public async canHandle(source: TreeItem, target: TreeItem): Promise<boolean> {
        return this.isSolutionFolder(source) && this.isValidTarget(target);
    }

    public async handle(source: TreeItem, target: TreeItem): Promise<Action[]> {
        if (!target.projectInSolution) { return []; }

        const targetpath = this.isSolution(target) ? 'root' :
            this.isProject(target) ? target.projectInSolution.parentProjectGuid || 'root' :
                this.isSolutionFolder(target) ? target.projectInSolution.projectGuid :
                    undefined;

        if (!target.solution || !source.projectInSolution || targetpath === undefined) { return []; }
        return [new MoveProject(target.solution, source.projectInSolution, targetpath)];
    }

    protected isProject(item: TreeItem): boolean {
        return !!item.project && !!item.projectInSolution;
    }

    protected isSolutionFolder(item: TreeItem): boolean {
        return !item.project && !!item.projectInSolution;
    }

    protected isSolution(item: TreeItem): boolean {
        return ContextValues.matchAnyLanguage(ContextValues.solution, item.contextValue) && !item.projectInSolution;
    }

    protected isValidTarget(item: TreeItem): boolean {
        return this.isProject(item) || this.isSolutionFolder(item) || this.isSolution(item);
    }
}
