import * as vscode from "vscode";
import * as terminal from "@extensions/terminal";
import * as path from "@extensions/path";
import * as config from "@extensions/config";
import { Action, ActionContext } from "./Action";

export abstract class TerminalAction implements Action {
    constructor(private readonly args: string[], private readonly workingFolder: string) {
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) {
            return Promise.resolve();
        }

        if (config.getSaveBeforeExecute()) {
            await vscode.workspace.saveAll(false);
        }

        const sanitizedArgs = this.args.map(arg => this.sanitizeArg(arg));
        const sanitizedWorkingFolder = this.sanitizePath(this.workingFolder);
        terminal.execute(sanitizedArgs, sanitizedWorkingFolder);
    }

    private sanitizeArg(arg: string): string {
        if (process.platform === "win32") {
            return arg.replace(/[;|&$`]/g, '');
        }
        return arg.replace(/[;|&$`\\]/g, '');
    }

    private sanitizePath(filePath: string): string {
        if (process.platform === "win32") {
            return filePath.replace(/[;|&$`]/g, '');
        }
        return filePath.replace(/[;|&$`\\]/g, '');
    }

    protected static getWorkingPath(solutionPath: string): string {
        return path.dirname(solutionPath);
    }
}
