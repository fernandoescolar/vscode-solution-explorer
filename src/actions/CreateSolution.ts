import { DotnetAction } from "./base/DotnetAction";

export class CreateSolution extends DotnetAction {
    constructor(private readonly solutionName: string, workingFolder: string) {
        super(["new", "sln", "-n", solutionName], workingFolder);
    }

    public toString(): string {
        return `Create solution ${this.solutionName}`;
    }
}