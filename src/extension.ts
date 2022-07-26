'use strict';

import * as vscode from "vscode";
import { EventAggregator } from "./events";
import { SolutionExplorerProvider } from "./SolutionExplorerProvider";
import { SolutionExplorerCommands } from "./SolutionExplorerCommands";
import { SolutionExplorerFileWatcher } from "./SolutionExplorerFileWatcher";
import * as SolutionExplorerConfiguration from "./SolutionExplorerConfiguration";
import { SolutionExplorerOutputChannel } from "./SolutionExplorerOutputChannel";
import { OmnisharpIntegrationService } from "./OmnisharpIntegrationService";

var eventAggregator, solutionExplorerProvider, solutionExplorerCommands, solutionExplorerFileWatcher, solutionExplorerOutputChannel, omnisharpIntegrationService;

export function activate(context: vscode.ExtensionContext) {
    const paths = vscode.workspace.workspaceFolders.map(w => w.uri.fsPath) || [];
    eventAggregator = new EventAggregator();
    solutionExplorerProvider = new SolutionExplorerProvider(paths, eventAggregator);
    solutionExplorerCommands = new SolutionExplorerCommands(context, solutionExplorerProvider, eventAggregator);
    solutionExplorerFileWatcher = new SolutionExplorerFileWatcher(eventAggregator);
    solutionExplorerOutputChannel = new SolutionExplorerOutputChannel(eventAggregator);
    omnisharpIntegrationService = new OmnisharpIntegrationService(eventAggregator);

    SolutionExplorerConfiguration.register();
    solutionExplorerProvider.register();
    solutionExplorerCommands.register();
    solutionExplorerFileWatcher.register();
    solutionExplorerOutputChannel.register();
    omnisharpIntegrationService.register();
}

export function deactivate() {
    solutionExplorerProvider.unregister();
    solutionExplorerFileWatcher.unregister();
    solutionExplorerOutputChannel.unregister();
    omnisharpIntegrationService.unregister();
}