import * as vscode from "vscode";
import * as path from "path";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem, ContextValues } from "../tree";
import { CommandBase } from "./base/CommandBase";
import { InputTextCommandParameter } from "./parameters/InputTextCommandParameter";

export class CreateFolderCommand extends CommandBase {

    constructor(private readonly provider: SolutionExplorerProvider) {
        super('Create folder');

        this.parameters = [
            new InputTextCommandParameter('New folder name', '')
        ];
    }

    protected shouldRun(item: TreeItem): boolean {
        return !!item.project;
    }

    protected async runCommand(item: TreeItem, args: string[]): Promise<void> {
        if (!args || args.length <= 0) return;

        try {
            let targetpath: string = item.path;
            if (!item.contextValue.startsWith(ContextValues.ProjectFolder))
                targetpath = path.dirname(targetpath);
                
            let folderpath = path.join(targetpath, args[0]);
            await item.project.createFolder(folderpath);
            this.provider.logger.log("Folder created: " + args[0]);
        } catch(ex) {
            this.provider.logger.error('Can not create folder: ' + ex);
        }    
    }
}