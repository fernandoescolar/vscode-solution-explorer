import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as sln from './tree';
import * as Utilities from './model/Utilities'
import { SolutionFile } from './model/Solutions';

export class SolutionExplorerProvider implements vscode.TreeDataProvider<sln.TreeItem> {

	private children: sln.TreeItem[] = null;
	private _onDidChangeTreeData: vscode.EventEmitter<sln.TreeItem | undefined> = new vscode.EventEmitter<sln.TreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<sln.TreeItem | undefined> = this._onDidChangeTreeData.event;
	//onDidChangeActiveTextEditor
	
	constructor(private workspaceRoot: string) {
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: sln.TreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: sln.TreeItem): Thenable<sln.TreeItem[]> {
		if (!this.workspaceRoot) {
			vscode.window.showInformationMessage('No .sln found in workspace');
			return Promise.resolve([]);
		}

		if (!element) {
			return new Promise((resolve, reject) => {
				if (this.children) return resolve(this.children);

				this.children = [];
				Utilities.searchFilesInDir(this.workspaceRoot, '.sln').then(solutionPaths => {
					let promises = [];
					if (solutionPaths.length <= 0)
						reject('No .sln found in workspace');

					solutionPaths.forEach(s => {
						promises.push(new Promise( resolve => {
							SolutionFile.Parse(s).then(solution => {
								let item = sln.CreateFromSolution(solution);
								this.children.push(item);
								resolve();
							})
						}));
					});

					Promise.all(promises).then( _ => {
						resolve(this.children);
					});
				});
			});
		} else {
			return element.getChildren();
		}
	}
}








