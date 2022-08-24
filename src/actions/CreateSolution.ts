import { DotnetAction } from "./base/DotnetAction";

export class CreateSolution extends DotnetAction {
    constructor(solutionName: string, workingFolder: string) {
        super(["new", "sln", "-n", solutionName], workingFolder);
    }
}