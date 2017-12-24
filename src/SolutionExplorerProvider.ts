import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import Item from './items/Item'
import * as ItemFactory from './items/ItemFactory' 

export class SolutionExplorerProvider implements vscode.TreeDataProvider<Item> {

	private _onDidChangeTreeData: vscode.EventEmitter<Item | undefined> = new vscode.EventEmitter<Item | undefined>();
	readonly onDidChangeTreeData: vscode.Event<Item | undefined> = this._onDidChangeTreeData.event;
	//onDidChangeActiveTextEditor
	
	constructor(private workspaceRoot: string) {
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Item): vscode.TreeItem {
		return element;
	}

	getChildren(element?: Item): Thenable<Item[]> {
		if (!this.workspaceRoot) {
			vscode.window.showInformationMessage('No .sln found in workspace');
			return Promise.resolve([]);
		}

		if (!element) {
			var result: Item[] = ItemFactory.getDirectorySolutions(this.workspaceRoot);
			if (result.length <= 0)
				vscode.window.showInformationMessage('No .sln found in workspace');

			return Promise.resolve(result);
		}
		
		if (element && element.children && element.children.length > 0) {
			return Promise.resolve(element.children);
		} else if (element.path) {
			return Promise.resolve(ItemFactory.getDirectoryItems(element.path));
		}
	}
}








