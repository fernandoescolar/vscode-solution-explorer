import * as vscode from "vscode";
import { SolutionExplorerProvider } from "./SolutionExplorerProvider";
import * as cmds from "./commands";

export class SolutionExplorerCommands {
    private commands: { [id:string]: cmds.ICommand } = {};

    constructor(private readonly context: vscode.ExtensionContext, private readonly provider: SolutionExplorerProvider) {
        this.commands['refresh'] = new cmds.RefreshCommand(provider);
        this.commands['collapseAll'] = new cmds.CollapseAllCommand(provider);
        this.commands['openFile'] = new cmds.OpenFileCommand();
        this.commands['renameFile'] = new cmds.RenameCommand(provider);
        this.commands['renameFolder'] = new cmds.RenameCommand(provider);
        this.commands['deleteFile'] = new cmds.DeleteCommand(provider);
        this.commands['deleteFolder'] = new cmds.DeleteCommand(provider);
        this.commands['createFile'] = new cmds.CreateFileCommand(provider);
        this.commands['createFolder'] = new cmds.CreateFolderCommand(provider);
        this.commands['moveFile'] = new cmds.MoveCommand(provider);
        this.commands['moveFolder'] = new cmds.MoveCommand(provider);
        this.commands['addPackage'] = new cmds.AddPackageCommand(provider);
        this.commands['removePackage'] = new cmds.RemovePackageCommand(provider);
        this.commands['addProjectReference'] = new cmds.AddProjectReferenceCommand(provider);
        this.commands['removeProjectReference'] = new cmds.RemoveProjectReferenceCommand(provider);
        this.commands['createNewSolution'] = new cmds.CreateNewSolutionCommand(provider);
        this.commands['addNewProject'] = new cmds.AddNewProjectCommand(provider);
        this.commands['addExistingProject'] = new cmds.AddExistingProjectCommand(provider);
        this.commands['removeProject'] = new cmds.RemoveProjectCommand(provider);
        this.commands['createSolutionFolder'] = new cmds.CreateSolutionFolderCommand(provider);
        this.commands['removeSolutionFolder'] = new cmds.RemoveSolutionFolderCommand(provider);
        this.commands['moveToSolutionFolder'] = new cmds.MoveToSolutionFolderCommand(provider);
        this.commands['renameSolutionItem'] = new cmds.RenameSolutionItemCommand(provider);
        this.commands['copy'] = new cmds.CopyCommand(provider);
        this.commands['duplicate'] = new cmds.DuplicateCommand(provider);
        this.commands['paste'] = new cmds.PasteCommand(provider);
        this.commands['build'] = new cmds.BuildCommand(provider);
        this.commands['clean'] = new cmds.CleanCommand(provider);
        this.commands['pack'] = new cmds.PackCommand(provider);
        this.commands['publish'] = new cmds.PublishCommand(provider);
        this.commands['restore'] = new cmds.RestoreCommand(provider);
        this.commands['run'] = new cmds.RunCommand(provider);
        this.commands['watchRun'] = new cmds.WatchRunCommand(provider);
        this.commands['test'] = new cmds.TestCommand(provider);
        this.commands['locate'] = new cmds.LocateCommand(provider);
    }

    public register() {
        Object.keys(this.commands).forEach(key => {
            this.registerCommand('solutionExplorer.' + key, this.commands[key]);
        });
    }

    private registerCommand(name: string, command: cmds.ICommand) {
        this.context.subscriptions.push(
            vscode.commands.registerCommand(name, item => {
                command.run(item)
            })
        );
    }
}