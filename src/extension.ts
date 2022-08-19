import * as vscode from "vscode";
import * as config from "@extensions/config";
import { EventAggregator } from "@events";
import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { SolutionExplorerCommands } from "./SolutionExplorerCommands";
import { SolutionExplorerFileWatcher } from "./SolutionExplorerFileWatcher";
import { SolutionExplorerOutputChannel } from "./SolutionExplorerOutputChannel";
import { OmnisharpIntegrationService } from "./OmnisharpIntegrationService";

type Unregistable = { unregister(): void };

type Registable = { register(): void };

let unregistables = new Array<Unregistable>();

function isUnregistable(object: any): object is Unregistable {
    return 'unregister' in object;
}

function register(service: Registable) : void {
	service.register();
	if (isUnregistable(service)) {
		unregistables.push(service);
	}
}

export function activate(context: vscode.ExtensionContext) {
	const paths = vscode.workspace.workspaceFolders?.map(w => w.uri.fsPath) || [];
    const eventAggregator = new EventAggregator();
    const solutionExplorerProvider = new SolutionExplorerProvider(paths, eventAggregator);
    const solutionExplorerCommands = new SolutionExplorerCommands(context, solutionExplorerProvider, eventAggregator);
    const solutionExplorerFileWatcher = new SolutionExplorerFileWatcher(eventAggregator);
    const solutionExplorerOutputChannel = new SolutionExplorerOutputChannel(eventAggregator);
    const omnisharpIntegrationService = new OmnisharpIntegrationService(eventAggregator);

    register(config);
    register(solutionExplorerProvider);
    register(solutionExplorerCommands);
    register(solutionExplorerFileWatcher);
    register(solutionExplorerOutputChannel);
    register(omnisharpIntegrationService);
}

export function deactivate() {
	for(let i = 0; i < unregistables.length; i++) {
		unregistables[i].unregister();
	}

	unregistables = [];
}
