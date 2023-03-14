import * as vscode from "vscode";
import * as cmds from "@commands";
import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { IEventAggregator } from "@events";
import { TemplateEngineCollection } from "@templates";
import { ContextValues, TreeItem } from "@tree";
import { ActionsRunner } from "./ActionsRunner";
import { Direction } from "@core/Projects/RelativeFilePosition";

export class SolutionExplorerCommands {
    private commands: { [id: string]: [command: cmds.ActionsCommand, allowedContexts: string[] | undefined] } = {};

    constructor(private readonly context: vscode.ExtensionContext,
                private readonly provider: SolutionExplorerProvider,
                private readonly actionsRunner: ActionsRunner,
                private readonly templateEngineCollection: TemplateEngineCollection,
                private readonly eventAggregator: IEventAggregator) {

        const { cps, both, fsharp } = ContextValues;

        this.commands['addExistingProject'] = [new cmds.AddExistingProjectCommand(provider),
            both(ContextValues.solution)];

        this.commands['addNewProject'] = [new cmds.AddNewProjectCommand(provider),
            both(ContextValues.solution)];

        this.commands['addPackage'] = [new cmds.AddPackageCommand(),
            cps(ContextValues.project, ContextValues.projectReferencedPackages)];

        this.commands['updatePackageVersion'] = [new cmds.UpdatePackageVersionCommand(),
            cps(ContextValues.projectReferencedPackage)];

        this.commands['addProjectReference'] = [new cmds.AddProjectReferenceCommand(),
            cps(ContextValues.project, ContextValues.projectReferencedProjects)];

        this.commands['addSolutionFile'] = [new cmds.AddExistingFileToSolutionFolderCommand(),
            [ContextValues.solutionFolder]];

        this.commands['build'] = [new cmds.BuildCommand(),
            cps(ContextValues.solution, ContextValues.project)];

        this.commands['clean'] = [new cmds.CleanCommand(),
            cps(ContextValues.solution, ContextValues.project)];

        this.commands['collapseAll'] = [new cmds.CollapseAllCommand(provider),
            undefined];

        this.commands['copy'] = [new cmds.CopyCommand(),
            [ContextValues.projectFolder, ContextValues.projectFile]];

        this.commands['createFile'] = [new cmds.CreateFileCommand(templateEngineCollection),
            [ContextValues.projectFile, ContextValues.projectFolder, ...both(ContextValues.project)]];

        this.commands['createFileAbove'] = [new cmds.CreateFileCommand(templateEngineCollection, Direction.Above),
            [...fsharp(ContextValues.projectFile)]];

        this.commands['createFileBelow'] = [new cmds.CreateFileCommand(templateEngineCollection, Direction.Below),
            [...fsharp(ContextValues.projectFile)]];

        this.commands['createFolder'] = [new cmds.CreateFolderCommand(),
            [ContextValues.projectFile, ContextValues.projectFolder, ...both(ContextValues.project)]];

        this.commands['createNewSolution'] = [new cmds.CreateNewSolutionCommand(),
            [ContextValues.noSolution]];

        this.commands['createSolutionFolder'] = [new cmds.CreateSolutionFolderCommand(),
            [ContextValues.solutionFolder, ...both(ContextValues.solution)]];

        this.commands['deleteFile'] = [new cmds.DeleteUnifiedCommand(),
            [ContextValues.projectFile, ...fsharp(ContextValues.projectFile)]];

        this.commands['deleteFolder'] = [new cmds.DeleteUnifiedCommand(),
            [ContextValues.projectFolder]];

        this.commands['deleteSolutionFile'] = [new cmds.DeleteUnifiedCommand(),
            [ContextValues.solutionFile]];

        this.commands['duplicate'] = [new cmds.DuplicateCommand(),
            [ContextValues.projectFile, ...fsharp(ContextValues.projectFile)]];

        this.commands['installTemplates'] = [new cmds.InstallWorkspaceTemplateFilesCommand(templateEngineCollection),
            both(ContextValues.solution)];

        this.commands['moveFile'] = [new cmds.MoveCommand(provider),
            [ContextValues.projectFile, ...fsharp(ContextValues.projectFile)]];

        this.commands['moveFileUp'] = [new cmds.MoveFileUpCommand(provider),
            [...fsharp(ContextValues.projectFile)]];

        this.commands['moveFileDown'] = [new cmds.MoveFileDownCommand(provider),
            [...fsharp(ContextValues.projectFile)]];

        this.commands['moveFolder'] = [new cmds.MoveCommand(provider),
            [ContextValues.projectFolder]];

        this.commands['moveToSolutionFolder'] = [new cmds.MoveToSolutionFolderCommand(),
            [ContextValues.solutionFolder, ...both(ContextValues.project)]];

        this.commands['openFile'] = [new cmds.OpenFileCommand(),
            both(ContextValues.solution, ContextValues.project)];

        this.commands['pack'] = [new cmds.PackCommand(),
            cps(ContextValues.solution, ContextValues.project)];

        this.commands['paste'] = [new cmds.PasteCommand(provider),
            [ContextValues.projectFolder, ContextValues.projectFile, ...fsharp(ContextValues.projectFile), ...both(ContextValues.project)]];

        this.commands['publish'] = [new cmds.PublishCommand(),
            cps(ContextValues.solution, ContextValues.project)];

        this.commands['refresh'] = [new cmds.RefreshCommand(provider),
            [ContextValues.projectFolder, ContextValues.solutionFolder, ...both(ContextValues.project)]];

        this.commands['removePackage'] = [new cmds.DeleteUnifiedCommand(),
            cps(ContextValues.projectReferencedPackage)];

        this.commands['removeProject'] = [new cmds.DeleteUnifiedCommand(),
            both(ContextValues.project)];

        this.commands['removeProjectReference'] = [new cmds.DeleteUnifiedCommand(),
            cps(ContextValues.projectReferencedProject)];

        this.commands['removeSolutionFolder'] = [new cmds.DeleteUnifiedCommand(),
            [ContextValues.solutionFolder]];

        this.commands['renameFile'] = [new cmds.RenameCommand(),
            [ContextValues.projectFile, ...fsharp(ContextValues.projectFile)]];

        this.commands['renameFolder'] = [new cmds.RenameCommand(),
            [ContextValues.projectFolder]];

        this.commands['renameSolutionItem'] = [new cmds.RenameSolutionItemCommand(provider),
            [ContextValues.solutionFolder, ...both(ContextValues.solution, ContextValues.project)]];

        this.commands['restore'] = [new cmds.RestoreCommand(),
            cps(ContextValues.solution, ContextValues.project)];

        this.commands['revealFileInOS'] = [new cmds.RevealInOSCommand(),
            [ContextValues.projectFile, ...fsharp(ContextValues.projectFile)]];

        this.commands['run'] = [new cmds.RunCommand(),
            cps(ContextValues.project)];

        this.commands['showActiveFileInExplorer'] = [new cmds.SelectActiveDocumentCommand(provider),
            undefined];

        this.commands['test'] = [new cmds.TestCommand(),
            cps(ContextValues.project)];

        this.commands['updatePackagesVersion'] = [new cmds.UpdatePackagesVersionCommand(),
            cps(ContextValues.project, ContextValues.projectReferencedPackages)];

        this.commands['watchRun'] = [new cmds.WatchRunCommand(),
            cps(ContextValues.project)];

        this.commands['openSolution'] = [new cmds.OpenSolutionCommand(eventAggregator),
            undefined];

        this.commands['deleteMultiple'] = [new cmds.DeleteUnifiedCommand(),
            [ContextValues.multipleSelection]];
    }

    public register() {
        Object.entries(this.commands).forEach(([key, [command, allowedContexts]]) => {
            this.registerCommand('solutionExplorer.' + key, command);
            if (allowedContexts) {
                vscode.commands.executeCommand('setContext', 'solutionExplorer.cmdAllowedContexts.' + key, allowedContexts);
            }
        });
    }

    private registerCommand(name: string, command: cmds.ActionsCommand) {
        this.context.subscriptions.push(
            vscode.commands.registerCommand(name, async (arg) => {
                const clickedItem = arg instanceof TreeItem ? arg : undefined;
                const selectedItems = this.provider.getSelectedItems();
                const actions = await command.getActionsBase(clickedItem, selectedItems);
                if (actions.length > 0) {
                    await this.actionsRunner.run(actions, { isCancellationRequested: false  });
                }
            })
        );
    }
}
