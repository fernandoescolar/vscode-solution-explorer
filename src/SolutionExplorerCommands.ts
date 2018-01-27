import * as vscode from "vscode";
import { SolutionExplorerProvider } from "./SolutionExplorerProvider";
import * as cmds from "./commands";

export class SolutionExplorerCommands {
    private refreshCommand: cmds.ICommand;
    private openFileCommand: cmds.ICommand;
    private renameCommand: cmds.ICommand;
    private deleteCommand: cmds.ICommand;
    private createFolderCommand: cmds.ICommand;
    private createFileCommand: cmds.ICommand;
    private moveCommand: cmds.ICommand;
    private addPackage: cmds.ICommand;
    private removePackage: cmds.ICommand;

    constructor(private readonly context: vscode.ExtensionContext, private readonly provider: SolutionExplorerProvider) {
        this.refreshCommand = new cmds.RefreshCommand(provider);
        this.openFileCommand = new cmds.OpenFileCommand();
        this.renameCommand = new cmds.RenameCommand(provider);
        this.deleteCommand = new cmds.DeleteCommand(provider);
        this.createFolderCommand = new cmds.CreateFolderCommand(provider);
        this.createFileCommand = new cmds.CreateFileCommand(provider);
        this.moveCommand = new cmds.MoveCommand(provider);
        this.addPackage = new cmds.AddPackageCommand(provider);
        this.removePackage = new cmds.RemovePackageCommand(provider);
    }

    public register() {
        this.registerCommand('solutionExplorer.refresh', this.refreshCommand);
        this.registerCommand('solutionExplorer.openFile', this.openFileCommand);
        this.registerCommand('solutionExplorer.renameFile', this.renameCommand);
        this.registerCommand('solutionExplorer.renameFolder', this.renameCommand);
        this.registerCommand('solutionExplorer.deleteFile', this.deleteCommand);
        this.registerCommand('solutionExplorer.deleteFolder', this.deleteCommand);
        this.registerCommand('solutionExplorer.createFolder', this.createFolderCommand);
        this.registerCommand('solutionExplorer.createFile', this.createFileCommand);
        this.registerCommand('solutionExplorer.moveFile', this.moveCommand);
        this.registerCommand('solutionExplorer.moveFolder', this.moveCommand);
        this.registerCommand('solutionExplorer.addPackage', this.addPackage);
        this.registerCommand('solutionExplorer.removePackage', this.removePackage);
    }

    private registerCommand(name: string, command: cmds.ICommand) {
        this.context.subscriptions.push(
            vscode.commands.registerCommand(name, item => { 
                command.run(item)
            })
        );
    }
}