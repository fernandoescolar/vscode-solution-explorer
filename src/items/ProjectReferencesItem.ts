import * as vscode from 'vscode'
import * as path from 'path'
import Item from './Item'

export default class ProjectReferencesItem extends Item {
	constructor() {
		super("references", vscode.TreeItemCollapsibleState.Collapsed, null);
		this.children = [];
	}

	iconPath = {
		light: path.join(__filename, '..', '..', '..', 'icons', 'folder.svg'),
		dark: path.join(__filename, '..', '..', '..', 'icons', 'folder.svg')
	};

	public children: Item[];

	public getChildren(): Item[] {
		var result = this.children;
		result.sort((a, b) => {
			var x = a.label.toLowerCase();
			var y = b.label.toLowerCase();
			return x < y ? -1 : x > y ? 1 : 0;
		});

		return result;
	}
}