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

    vscode.commands.registerCommand('solutionExplorer.renameFile', item => {
      if (!item.rename) return;
      vscode.window.showInputBox({ placeHolder: item.label })
        .then(value => {
          if (value !== null && value !== undefined) {
            try {
              item.rename(value);
              item.parent.refresh();
              solutionExplorerProvider.refresh(item.parent);
            } catch(ex) {
              vscode.window.showInformationMessage('Can not rename file: ' + ex);
            }
          }
        });
    });

    vscode.commands.registerCommand('solutionExplorer.deleteFile', item => {
      if (!item.delete) return;
        try {
          item.delete();
          item.parent.refresh();
          solutionExplorerProvider.refresh(item.parent);
        } catch(ex) {
          vscode.window.showInformationMessage('Can not delete file: ' + ex);
        }
    });

    vscode.commands.registerCommand('solutionExplorer.createFile', item => {
      if (!item.createFile) {
        if (item.parent && item.parent.createFile)
          item = item.parent;
        else
          return;
      }
      vscode.window.showInputBox({ placeHolder: 'New filename' })
        .then(value => {
          if (value !== null && value !== undefined) {
            try {
              let filepath = item.createFile(value);
              item.refresh();
              solutionExplorerProvider.refresh(item);
              vscode.workspace.openTextDocument(filepath).then(document => {
                vscode.window.showTextDocument(document);
              });
            } catch(ex) {
              vscode.window.showInformationMessage('Can not create file: ' + ex);
            }
          }
        });
    });

    vscode.commands.registerCommand('solutionExplorer.renameFolder', item => {
      if (!item.rename) return;
      vscode.window.showInputBox({ placeHolder: item.label })
        .then(value => {
          if (value !== null && value !== undefined) {
            try {
              item.rename(value);
              item.parent.refresh();
              solutionExplorerProvider.refresh(item.parent);
            } catch(ex) {
              vscode.window.showInformationMessage('Can not rename folder: ' + ex);
            }
          }
        });
    });

    vscode.commands.registerCommand('solutionExplorer.deleteFolder', item => {
      if (!item.delete) return;
        try {
          item.delete();
          item.parent.refresh();
          solutionExplorerProvider.refresh(item.parent);
        } catch(ex) {
          vscode.window.showInformationMessage('Can not delete folder: ' + ex);
        }
    });

    vscode.commands.registerCommand('solutionExplorer.createFolder', item => {
      if (!item.createFolder) {
        if (item.parent && item.parent.createFolder)
          item = item.parent;
        else
          return;
      }
      vscode.window.showInputBox({ placeHolder: 'New folder name' })
        .then(value => {
          if (value !== null && value !== undefined) {
            try {
              item.createFolder(value);
              item.refresh();
              solutionExplorerProvider.refresh(item);
            } catch(ex) {
              vscode.window.showInformationMessage('Can not create folder: ' + ex);
            }
          }
        });
    });

    vscode.commands.registerCommand('solutionExplorer.openFile', (node: any) => {
      vscode.workspace.openTextDocument(node).then(document => {
        vscode.window.showTextDocument(document);
      });
    });
}

// this method is called when your extension is deactivated
export function deactivate() {
}