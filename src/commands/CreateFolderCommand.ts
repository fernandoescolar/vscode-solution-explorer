import * as vscode from "vscode";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem, IFolderCreator, isFolderCreator } from "../tree";
import { CommandBase } from "./base/CommandBase";
import { InputTextCommandParameter } from "./parameters/InputTextCommandParameter";

export class CreateFolderCommand extends CommandBase {

    constructor(private readonly provider: SolutionExplorerProvider) {
        super();

        this.parameters = [
            new InputTextCommandParameter('New folder name')
        ];
    }

    protected shouldRun(item: TreeItem): boolean {
        return isFolderCreator(item);
    }

    protected async runCommand(item: TreeItem, args: string[]): Promise<string[]> {
        if (!args || args.length <= 0) return;

        let folderCreator = <IFolderCreator> (<any>item);
        try {
            await folderCreator.createFolder(args[0]);
        } catch(ex) {
            vscode.window.showInformationMessage('Can not create folder: ' + ex);
        }    
    }
}