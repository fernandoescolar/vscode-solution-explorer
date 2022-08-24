import { TreeItem } from "@tree";
import { MoveSolutionFolderInTheSameSolution } from "./MoveSolutionFolderInTheSameSolution";

export class MoveProjectInTheSameSolution extends MoveSolutionFolderInTheSameSolution {
    public async canHandle(source: TreeItem, target: TreeItem): Promise<boolean> {
        return this.isProject(source) && this.isValidTarget(target);
    }
}
