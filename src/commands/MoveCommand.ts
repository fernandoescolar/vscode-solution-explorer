import * as vscode from "vscode";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem, ContextValues } from "../tree";
import { CommandBase } from "./base/CommandBase";
import { InputOptionsCommandParameter } from "./parameters/InputOptionsCommandParameter";

export class MoveCommand extends CommandBase {

    constructor(private readonly provider: SolutionExplorerProvider) {
        super('Move');
    }

    protected shouldRun(item: TreeItem): boolean {
        this.parameters = [
            new InputOptionsCommandParameter('Select folder...', () => item.project.getFolderList())
        ];

        return !!item.project;
    }

    protected async runCommand(item: TreeItem, args: string[]): Promise<void> {
        if (!args || args.length <= 0) return;

        try {
            let newPath: string;
            if (item.contextValue.startsWith(ContextValues.ProjectFile))
                newPath = await item.project.moveFile(item.path, args[0]);
            else if (item.contextValue.startsWith(ContextValues.ProjectFolder))
                newPath = await item.project.moveFolder(item.path, args[0]);
            else 
                return;

            this.provider.logger.log("Moved: " + item.path + " -> " + newPath);
        } catch(ex) {
            this.provider.logger.error('Can not move item: ' + ex);
        }    
    }
}