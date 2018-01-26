import * as vscode from "vscode";
import { SolutionExplorerProvider } from "./SolutionExplorerProvider";
import { ICommand, RenameCommand, RefreshCommand, OpenFileCommand, DeleteCommand, CreateFolderCommand, CreateFileCommand, MoveCommand } from "./commands";

export class SolutionExplorerCommands {
    private refreshCommand: ICommand;
    private openFileCommand: ICommand;
    private renameCommand: ICommand;
    private deleteCommand: ICommand;
    private createFolderCommand: ICommand;
    private createFileCommand: ICommand;
    private moveCommand: ICommand;

    constructor(private readonly context: vscode.ExtensionContext, private readonly provider: SolutionExplorerProvider) {
        this.refreshCommand = new RefreshCommand(provider);
        this.openFileCommand = new OpenFileCommand();
        this.renameCommand = new RenameCommand(provider);
        this.deleteCommand = new DeleteCommand(provider);
        this.createFolderCommand = new CreateFolderCommand(provider);
        this.createFileCommand = new CreateFileCommand(provider);
        this.moveCommand = new MoveCommand(provider);
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
    }

    private registerCommand(name: string, command: ICommand) {
        this.context.subscriptions.push(
            vscode.commands.registerCommand(name, item => { 
                command.run(item)
            })
        );
    }
}