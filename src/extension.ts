'use strict';

import * as vscode from "vscode";
import { EventAggregator } from "./events";
import { SolutionExplorerProvider } from "./SolutionExplorerProvider";
import { SolutionExplorerCommands } from "./SolutionExplorerCommands";
import { SolutionExplorerFileWatcher } from "./SolutionExplorerFileWatcher";
import * as SolutionExplorerConfiguration from "./SolutionExplorerConfiguration";

var eventAggregator, solutionExplorerProvider, solutionExplorerCommands, solutionExplorerFileWatcher;

export function activate(context: vscode.ExtensionContext) {
    const rootPath = vscode.workspace.rootPath;
    eventAggregator = new EventAggregator();
    solutionExplorerProvider = new SolutionExplorerProvider(rootPath, eventAggregator);
    solutionExplorerCommands = new SolutionExplorerCommands(solutionExplorerProvider);
    solutionExplorerFileWatcher = new SolutionExplorerFileWatcher(eventAggregator);

    SolutionExplorerConfiguration.register();
    solutionExplorerProvider.register();
    solutionExplorerCommands.register();
    solutionExplorerFileWatcher.register();
}

export function deactivate() {
    solutionExplorerFileWatcher.unregister();
}