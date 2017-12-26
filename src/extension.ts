'use strict';

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SolutionExplorerProvider } from './SolutionExplorerProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const rootPath = vscode.workspace.rootPath;
    const solutionExplorerProvider = new SolutionExplorerProvider(rootPath);

    vscode.window.registerTreeDataProvider('solutionExplorer', solutionExplorerProvider);
    vscode.commands.registerCommand('solutionExplorer.refresh', () => solutionExplorerProvider.refresh());
    
    vscode.commands.registerCommand('openSolutionItem', (node: any) => {
      vscode.workspace.openTextDocument(node).then(document => {
        vscode.window.showTextDocument(document);
      });
    });
}

// this method is called when your extension is deactivated
export function deactivate() {
}