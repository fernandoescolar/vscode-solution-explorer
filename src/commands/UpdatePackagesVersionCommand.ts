import * as vscode from "vscode";
import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem } from "@tree";
import { CliCommandBase } from "@commands/base";

export class UpdatePackagesVersionCommand extends CliCommandBase {
    constructor(provider: SolutionExplorerProvider) {
        super('Restore', provider, 'dotnet');
    }

    protected shouldRun(item: TreeItem): boolean {
        return !!item && !!item.project;
    }

    protected async runCommand(item: TreeItem, args: string[]): Promise<void> {
        if (!item || !item.project) { return; }

        var references = await item.project.getPackageReferences();
        for(let i = 0; i < references.length; i++) {
            const reference = references[i];
            const parameters = [ 'add', item.project.fullPath, 'package', reference.name ];
            await this.runCliCommand('dotnet', parameters, vscode.workspace.rootPath || "");
        }
    }
}