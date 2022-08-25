import { ProjectInSolution, SolutionFile } from "@core/Solutions";
import { MoveSolutionFolder } from "./MoveSolutionFolder";

export class MoveProject extends MoveSolutionFolder {
    constructor(solution: SolutionFile, projectInSolution: ProjectInSolution, targetPath: string) {
        super(solution, projectInSolution, targetPath);
    }

    public toString(): string {
        return `Move project ${this.projectInSolution.projectName} to ${this.targetPath}in ${this.solution.name}`;
    }
}
