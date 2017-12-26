import * as vscode from 'vscode'
import * as path from 'path'
import Item from './Item'

export default class ProjectReferencesFolderItem extends Item {
	constructor() {
		super("references", vscode.TreeItemCollapsibleState.Collapsed, null);
		this.children = [];
	}

	iconPath = {
		light: path.join(__filename, '..', '..', '..', 'icons', 'references.svg'),
		dark: path.join(__filename, '..', '..', '..', 'icons', 'references.svg')
	};

	public children: Item[];

	public getChildren(): Item[] {
		return this.children;
	}
}