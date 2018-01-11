import * as vscode from "vscode";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem, IRenameable, IRefreshable, isRenameable, isRefreshable } from "../tree";
import { CommandBase } from "./base/CommandBase";
import { InputTextCommandParameter } from "./parameters/InputTextCommandParameter";

export class RenameCommand extends CommandBase {

    constructor(private readonly provider: SolutionExplorerProvider) {
        super();
    }

    protected ShouldRun(item: TreeItem): boolean {
        if (!isRenameable(item)) return false;

        this.parameters = [
            new InputTextCommandParameter(item.label)
        ];

        return true;
    }

    protected async RunCommand(item: TreeItem, args: string[]): Promise<string[]> {
        if (!args || args.length <= 0) return;

        let renameable = <IRenameable> (<any>item);
        try {
            await renameable.rename(args[0]);
            if (isRefreshable(item.parent)) {
                let refreshable = <IRefreshable> (<any> item.parent);
                refreshable.refresh();
            }
            
            this.provider.refresh(item.parent);
        } catch(ex) {
            vscode.window.showInformationMessage('Can not rename item: ' + ex);
        }    
    }
}