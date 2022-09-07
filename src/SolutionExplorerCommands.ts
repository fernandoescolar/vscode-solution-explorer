import * as vscode from "vscode";
import * as cmds from "@commands";
import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { IEventAggregator } from "@events";
import { TemplateEngineColletion } from "@templates";
import { TreeItem } from "@tree";
import { ActionsRunner } from "./ActionsRunner";

export class SolutionExplorerCommands {
    private commands: { [id:string]: cmds.ActionsCommand } = {};

    constructor(private readonly context: vscode.ExtensionContext,
                private readonly provider: SolutionExplorerProvider,
                private readonly actionsRunner: ActionsRunner,
                private readonly templateEngineCollection: TemplateEngineColletion,
                private readonly eventAggregator: IEventAggregator) {
        this.commands['addExistingProject'] = new cmds.AddExistingProjectCommand();
        this.commands['addNewProject'] = new cmds.AddNewProjectCommand();
        this.commands['addPackage'] = new cmds.AddPackageCommand();
        this.commands['addProjectReference'] = new cmds.AddProjectReferenceCommand();
        this.commands['addSolutionFile'] = new cmds.AddExistingFileToSolutionFolderCommand();
        this.commands['build'] = new cmds.BuildCommand();
        this.commands['clean'] = new cmds.CleanCommand();
        this.commands['collapseAll'] = new cmds.CollapseAllCommand(provider);
        this.commands['copy'] = new cmds.CopyCommand();
        this.commands['createFile'] = new cmds.CreateFileCommand(templateEngineCollection);
        this.commands['createFolder'] = new cmds.CreateFolderCommand();
        this.commands['createNewSolution'] = new cmds.CreateNewSolutionCommand();
        this.commands['createSolutionFolder'] = new cmds.CreateSolutionFolderCommand();
        this.commands['deleteFile'] = new cmds.DeleteCommand();
        this.commands['deleteFolder'] = new cmds.DeleteCommand();
        this.commands['deleteSolutionFile'] = new cmds.DeleteFileFromSolutionFolderCommand();
        this.commands['duplicate'] = new cmds.DuplicateCommand();
        this.commands['installTemplates'] = new cmds.InstallWorkspaceTemplateFilesCommand(templateEngineCollection);
        this.commands['moveFile'] = new cmds.MoveCommand(provider);
        this.commands['moveFolder'] = new cmds.MoveCommand(provider);
        this.commands['moveToSolutionFolder'] = new cmds.MoveToSolutionFolderCommand();
        this.commands['openFile'] = new cmds.OpenFileCommand();
        this.commands['pack'] = new cmds.PackCommand();
        this.commands['paste'] = new cmds.PasteCommand(provider);
        this.commands['publish'] = new cmds.PublishCommand();
        this.commands['refresh'] = new cmds.RefreshCommand(provider);
        this.commands['removePackage'] = new cmds.RemovePackageCommand();
        this.commands['removeProject'] = new cmds.RemoveProjectCommand();
        this.commands['removeProjectReference'] = new cmds.RemoveProjectReferenceCommand();
        this.commands['removeSolutionFolder'] = new cmds.RemoveSolutionFolderCommand();
        this.commands['renameFile'] = new cmds.RenameCommand();
        this.commands['renameFolder'] = new cmds.RenameCommand();
        this.commands['renameSolutionItem'] = new cmds.RenameSolutionItemCommand(provider);
        this.commands['restore'] = new cmds.RestoreCommand();
        this.commands['revealFileInOS'] = new cmds.RevealInOSCommand();
        this.commands['run'] = new cmds.RunCommand();
        this.commands['showActiveFileInExplorer'] = new cmds.SelectActiveDocumentCommand(provider);
        this.commands['test'] = new cmds.TestCommand();
        this.commands['updatePackagesVersion'] = new cmds.UpdatePackagesVersionCommand();
        this.commands['watchRun'] = new cmds.WatchRunCommand();
        this.commands['openSolution'] = new cmds.OpenSolutionCommand(eventAggregator);
        this.commands['createNewProject'] = new cmds.CreateNewProjectCommand(context);
    }

    public register() {
        Object.keys(this.commands).forEach(key => {
            this.registerCommand('solutionExplorer.' + key, this.commands[key]);
        });
    }

    private registerCommand(name: string, command: cmds.ActionsCommand) {
        this.context.subscriptions.push(
            vscode.commands.registerCommand(name, async (item) => {
                if (command.shouldRun(item as TreeItem)) {
                    const actions = await command.getActions(item);
                    if (actions.length > 0) {
                        await this.actionsRunner.run(actions, { isCancellationRequested: false  });
                    }
                }
            })
        );
    }
}
