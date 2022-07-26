import * as path from "path";
import * as os from "os";
import * as vscode from "vscode";
import { TreeItem, ContextValues } from '../../tree';
import { CommandBase } from './CommandBase';
import { SolutionExplorerProvider } from '../../SolutionExplorerProvider';

const TERMINAL_NAME:string = "dotnet";

export abstract class CliCommandBase extends CommandBase {

    constructor(title: string, protected readonly provider: SolutionExplorerProvider, protected readonly app: string) {
        super(title);
    }

    protected runCommand(item: TreeItem, args: string[]): Promise<void> {
        let workingFolder = this.getWorkingFolder(item);
        return this.runCliCommand(this.app, args, workingFolder);
    }

    protected runCliCommand(app: string, args: string[], path: string): Promise<void> {
        this.checkCurrentEncoding();

        const terminal = this.ensureTerminal(path);

        let cargs: string[] = Array<string>(args.length);
        args.forEach((a, index) => cargs[index] = '"' + a + '"');
        terminal.sendText( [ app, ...cargs ].join(' '), true);
        // this.provider.logger.log('Terminal: ' + [ app, ...args ].join(' '));
        terminal.show();

        return Promise.resolve();
    }

    private getWorkingFolder(item: TreeItem): string {
        if (item && item.path && item.contextValue !== ContextValues.ProjectReferencedPackage) return path.dirname(item.path);
        if (item && item.project) return path.dirname(item.project.fullPath);
        if (item && item.solution) return item.solution.FolderPath;
        return vscode.workspace.rootPath;
    }

    private checkCurrentEncoding(): void {
        if (os.platform() === "win32") {
        }
    }

    private ensureTerminal(path: string): vscode.Terminal {
        let terminal: vscode.Terminal;
        vscode.window.terminals.forEach(t => { if(t.name === TERMINAL_NAME) terminal = t; });

        if (!terminal) {
            terminal = vscode.window.createTerminal({ name: TERMINAL_NAME, cwd: path });
        } else {
            terminal.sendText( [ "cd", `"${path}"` ].join(' '), true);
        }

        return terminal;
    }
}