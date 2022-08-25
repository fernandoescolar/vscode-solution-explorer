import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import * as dialogs from "@extensions/dialogs";
import { Action, ActionContext } from "./base/Action";


export class RenameSolution implements Action {
    constructor(private readonly solutionPath: string, private readonly solutionname: string) {
    }

    public toString(): string {
        return `Rename solution ${this.solutionPath} to ${this.solutionname}`;
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) {
            return;
        }

        const newSolutionPath = path.join(path.dirname(this.solutionPath), this.solutionname);
        if (newSolutionPath === this.solutionPath) {
            return;
        }

        if (await fs.exists(newSolutionPath)) {
            await dialogs.showError("Solution already exists");
            return;
        }

        await fs.rename(this.solutionPath, newSolutionPath);
    }
}
