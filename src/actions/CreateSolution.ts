import { CustomTerminalAction } from "./base/CustomTerminalAction";

export class CreateSolution extends CustomTerminalAction {
    constructor(private readonly solutionName: string, workingFolder: string) {
        super({
            name: "createSolution",
            parameters: { solutionName },
            workingFolder
        })
    }

    public toString(): string {
        return `Create solution ${this.solutionName}`;
    }
}
