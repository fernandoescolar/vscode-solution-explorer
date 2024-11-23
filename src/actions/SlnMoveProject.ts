import { SolutionItem, Solution } from "@core/Solutions";
import { SlnMoveSolutionFolder } from "./SlnMoveSolutionFolder";

export class SlnMoveProject extends SlnMoveSolutionFolder {
    constructor(solution: Solution, solutionItem: SolutionItem, targetPath: string) {
        super(solution, solutionItem, targetPath);
    }

    public toString(): string {
        return `Move project ${this.solutionItem.name} to ${this.folderId} in ${this.solution.name}`;
    }
}
