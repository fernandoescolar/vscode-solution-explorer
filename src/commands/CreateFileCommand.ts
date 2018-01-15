import * as vscode from "vscode";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem, IFileCreator, IRefreshable, isFileCreator, isRefreshable } from "../tree";
import { CommandBase } from "./base/CommandBase";
import { InputTextCommandParameter } from "./parameters/InputTextCommandParameter";

export class CreateFileCommand extends CommandBase {

    constructor(private readonly provider: SolutionExplorerProvider) {
        super();

        this.parameters = [
            new InputTextCommandParameter('New file name')
        ];
    }

    protected shouldRun(item: TreeItem): boolean {
        return isFileCreator(item);
    }

    protected async runCommand(item: TreeItem, args: string[]): Promise<string[]> {
        if (!args || args.length <= 0) return;

        let fileCreator = <IFileCreator> (<any>item);
        try {
            let filepath = await fileCreator.createFile(args[0]);
            if (isRefreshable(item)) {
                let refreshable = <IRefreshable> (<any> item);
                refreshable.refresh();
            }
            
            this.provider.refresh(item);

            let document = await vscode.workspace.openTextDocument(filepath);
            vscode.window.showTextDocument(document);  
        } catch(ex) {
            vscode.window.showInformationMessage('Can not create file: ' + ex);
        }    
    }
}