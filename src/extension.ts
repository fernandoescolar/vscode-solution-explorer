'use strict';

import * as vscode from "vscode";
import { SolutionExplorerProvider } from "./SolutionExplorerProvider";
import { SolutionExplorerCommands } from "./SolutionExplorerCommands";
import * as SolutionExplorerConfiguration from "./SolutionExplorerConfiguration";

var solutionExplorerProvider, solutionExplorerCommands;

export function activate(context: vscode.ExtensionContext) {
    const rootPath = vscode.workspace.rootPath;
    solutionExplorerProvider = new SolutionExplorerProvider(rootPath);
    solutionExplorerCommands = new SolutionExplorerCommands(solutionExplorerProvider);

    SolutionExplorerConfiguration.register();
    solutionExplorerProvider.register();
    solutionExplorerCommands.register();
}

export function deactivate() {
}