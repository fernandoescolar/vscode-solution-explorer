import { Solution, SolutionFolder } from "@core/Solutions";
import { SlnxMoveSolutionFolder } from "./SlnxMoveSolutionFolder";

export class SlnxMoveProject extends SlnxMoveSolutionFolder {
    constructor(solution: Solution, solutionItem: SolutionFolder, targetPath: string) {
        super(solution, solutionItem, targetPath);
    }

    public toString(): string {
        return `Move project ${this.solutionItem.name} to ${this.folderId} in ${this.solution.name}`;
    }
}
