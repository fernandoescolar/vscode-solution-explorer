import * as terminal from "@extensions/terminal";
import * as path from "@extensions/path";
import { Action, ActionContext } from "./Action";

export abstract class TerminalAction implements Action {
    constructor(private readonly args: string[], private readonly workingFolder: string) {
    }

    public execute(context: ActionContext): Promise<void> {
        if (context.cancelled) {
            return Promise.resolve();
        }

        terminal.execute(this.args, this.workingFolder);
        return Promise.resolve();
    }

    protected static getWorkingPath(solutionPath: string): string {
        return path.dirname(solutionPath);
    }
}
