import * as vscode from "vscode";
import * as path from "path";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem, ContextValues } from "../tree";
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
        return !!item.project;
    }

    protected async runCommand(item: TreeItem, args: string[]): Promise<void> {
        if (!args || args.length <= 0) return;

        try {
            let targetpath: string = item.path;
            if (item.contextValue.startsWith(ContextValues.Project))
                targetpath = path.dirname(targetpath);

            let filepath = await item.project.createFile(targetpath, args[0]);
            let document = await vscode.workspace.openTextDocument(filepath);
            vscode.window.showTextDocument(document);  
            this.provider.logger.log("File created: " + filepath);
        } catch(ex) {
            this.provider.logger.error('Can not create file: ' + ex);
        }    
    }
}