import * as vscode from "vscode";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem, IDeletable, isDeletable } from "../tree";
import { CommandBase } from "./base/CommandBase";
import { ConfirmCommandParameter } from "./parameters/ConfirmCommandParameter";

export class DeleteCommand extends CommandBase {

    constructor(private readonly provider: SolutionExplorerProvider) {
        super();
    }

    protected shouldRun(item: TreeItem): boolean {
        if (!isDeletable(item)) return false;

        this.parameters = [
            new ConfirmCommandParameter('Are you sure you want to delete file "'+ item.label + '"?')
        ];

        return true;
    }

    protected async runCommand(item: TreeItem, args: string[]): Promise<string[]> {
        let renameable = <IDeletable> (<any>item);
        try {
            await renameable.delete();
        } catch(ex) {
            vscode.window.showInformationMessage('Can not delete item: ' + ex);
        }    

        return [];
    }
}