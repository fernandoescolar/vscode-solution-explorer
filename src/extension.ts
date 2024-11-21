import * as vscode from "vscode";
import * as config from "@extensions/config";
import { EventAggregator } from "@events";
import { Logger } from "@logs";
import { ActionsRunner } from "./ActionsRunner";
import { SolutionTreeItemCollection } from "./SolutionTreeItemCollection";
import { SolutionFinder } from "./SolutionFinder";
import { SolutionExplorerDragAndDropController } from "./SolutionExplorerDragAndDropController";
import { SolutionExplorerProvider } from "./SolutionExplorerProvider";
import { SolutionExplorerCommands } from "./SolutionExplorerCommands";
import { SolutionExplorerFileWatcher } from "./SolutionExplorerFileWatcher";
import { SolutionExplorerOutputChannel } from "./SolutionExplorerOutputChannel";
import { OmnisharpIntegrationService } from "./OmnisharpIntegrationService";
import { LanguageExtensions } from "./language";
import { TemplateEngineCollection } from "@templates";

export function activate(context: vscode.ExtensionContext) {
	const paths = vscode.workspace.workspaceFolders?.map(w => w.uri.fsPath) || [];
    const eventAggregator = new EventAggregator();
    const logger = new Logger(eventAggregator);
    const actionsRunner = new ActionsRunner(logger);
    const solutionTreeItemCollection = new SolutionTreeItemCollection();
    const solutionFinder = new SolutionFinder(paths, eventAggregator);
    const solutionExplorerDragAndDropController = new SolutionExplorerDragAndDropController(actionsRunner, solutionTreeItemCollection);
    const templateEngineCollection = new TemplateEngineCollection();
    const solutionExplorerProvider = new SolutionExplorerProvider(solutionFinder, solutionTreeItemCollection, solutionExplorerDragAndDropController, templateEngineCollection, eventAggregator, logger);
    const solutionExplorerCommands = new SolutionExplorerCommands(context, solutionExplorerProvider, actionsRunner, templateEngineCollection, eventAggregator);
    const solutionExplorerFileWatcher = new SolutionExplorerFileWatcher(eventAggregator);
    const solutionExplorerOutputChannel = new SolutionExplorerOutputChannel(eventAggregator);
    const omnisharpIntegrationService = new OmnisharpIntegrationService(eventAggregator);
    const nugetCompletionItemProvider = new LanguageExtensions(context);

    register(context, config);
    register(context, eventAggregator);
    register(context, logger);
    register(context, actionsRunner);
    register(context, solutionTreeItemCollection);
    register(context, solutionFinder);
    register(context, solutionExplorerDragAndDropController);
    register(context, templateEngineCollection);
    register(context, solutionExplorerProvider);
    register(context, solutionExplorerCommands);
    register(context, solutionExplorerFileWatcher);
    register(context, solutionExplorerOutputChannel);
    register(context, omnisharpIntegrationService);
    register(context, nugetCompletionItemProvider);
}

export function deactivate() {
	for(let i = 0; i < unregistables.length; i++) {
		unregistables[i].unregister();
	}

	unregistables = [];
}

type Unregistable = { unregister(): void };

type Registable = { register(): void };

let unregistables = new Array<Unregistable>();

function isUnregistable(object: any): object is Unregistable {
    return 'unregister' in object;
}

function isRegistable(object: any): object is Registable {
    return 'register' in object;
}

function isDisposable(object: any): object is vscode.Disposable {
    return 'dispose' in object;
}

function register(context: vscode.ExtensionContext, service: any) : void {
    if (isRegistable(service)) {
	    service.register();
    }

	if (isUnregistable(service)) {
		unregistables.push(service);
	}

    if (isDisposable(service)) {
        context.subscriptions.push(service);
    }
}
