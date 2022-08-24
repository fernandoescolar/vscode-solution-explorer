import { ContextValues, TreeItem } from "@tree";
import { Action, MoveProject } from "@actions";
import { DropHandler } from "./DropHandler";

export class MoveSolutionFolderInTheSameSolution extends DropHandler {
    public async canHandle(source: TreeItem, target: TreeItem): Promise<boolean> {
        return this.isSolutionFolder(source) && this.isValidTarget(target);
    }

    public async handle(source: TreeItem, target: TreeItem): Promise<Action[]> {
        const targetpath = this.isSolution(target) ? 'root' :
            this.isProject(target) ? (await (<any>target).projectInSolution.parentProjectGuid) || 'root' :
                this.isSolutionFolder(target) ? (await (<any>target).projectInSolution.projectGuid) :
                    undefined;

        if (!target.solution || !(<any>source).projectInSolution || targetpath === undefined) { return []; }
        return [new MoveProject(target.solution, (<any>source).projectInSolution, targetpath)];
    }

    protected isProject(item: TreeItem): boolean {
        return !!item.project && !!(<any>item).projectInSolution;
    }

    protected isSolutionFolder(item: TreeItem): boolean {
        return !item.project && !!(<any>item).projectInSolution;
    }

    protected isSolution(item: TreeItem): boolean {
        return item.contextValue.startsWith(ContextValues.solution) && !(<any>item).projectInSolution;
    }

    protected isValidTarget(item: TreeItem): boolean {
        return this.isProject(item) || this.isSolutionFolder(item) || this.isSolution(item);
    }
}
