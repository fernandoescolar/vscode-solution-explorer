import * as vscode from 'vscode'
import * as path from 'path'
import Item from './Item'

export default class SolutionFolderItem extends Item {
	constructor(name: string) {
		super(name, vscode.TreeItemCollapsibleState.Expanded, null);

		this.children = [];
	}

	public children: Item[];

	iconPath = {
		light: path.join(__filename, '..', '..', '..', 'icons', 'folder.svg'),
		dark: path.join(__filename, '..', '..', '..', 'icons', 'folder.svg')
	};

	public getChildren(): Item[]{
		return this.children;
	}
}
