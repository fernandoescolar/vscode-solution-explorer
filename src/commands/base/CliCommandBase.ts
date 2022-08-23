import * as vscode from "vscode";
import * as path from "@extensions/path";
import * as terminal from "@extensions/terminal";
import { TreeItem, ContextValues } from '@tree';
import { SolutionExplorerProvider } from '@SolutionExplorerProvider';
import { CommandBase } from './CommandBase';

export abstract class CliCommandBase extends CommandBase {
    constructor(title: string, protected readonly provider: SolutionExplorerProvider, protected readonly app: string) {
        super(title);
    }

    protected runCommand(item: TreeItem, args: string[]): Promise<void> {
        let workingFolder = this.getWorkingFolder(item);
        return this.runCliCommand(this.app, args, workingFolder);
    }

    protected runCliCommand(app: string, args: string[], workingFolder: string): Promise<void> {
        let cargs: string[] = Array<string>(args.length);
        args.forEach((a, index) => cargs[index] = '"' + a + '"');
        terminal.execute( [ app, ...cargs ], workingFolder);

        return Promise.resolve();
    }

    protected getWorkingFolder(item: TreeItem): string {
        if (item && item.path && item.contextValue !== ContextValues.projectReferencedPackage) { return path.dirname(item.path); }
        if (item && item.project) { return path.dirname(item.project.fullPath); }
        if (item && item.solution) { return item.solution.folderPath; }
        return vscode.workspace.rootPath || "";
    }
}
