import * as vscode from "vscode";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem, IRenameable, isRenameable } from "../tree";
import { CommandBase } from "./base/CommandBase";
import { InputTextCommandParameter } from "./parameters/InputTextCommandParameter";

export class RenameCommand extends CommandBase {

    constructor(private readonly provider: SolutionExplorerProvider) {
        super();
    }

    protected shouldRun(item: TreeItem): boolean {
        if (!isRenameable(item)) return false;

        this.parameters = [
            new InputTextCommandParameter(item.label)
        ];

        return true;
    }

    protected async runCommand(item: TreeItem, args: string[]): Promise<string[]> {
        if (!args || args.length <= 0) return;

        let renameable = <IRenameable> (<any>item);
        try {
            await renameable.rename(args[0]);
        } catch(ex) {
            vscode.window.showInformationMessage('Can not rename item: ' + ex);
        }    
    }
}