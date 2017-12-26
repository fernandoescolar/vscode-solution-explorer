import * as vscode from 'vscode'
import * as path from 'path'
import Item from './Item'

export default class ProjectReferenceItem extends Item {
	constructor(name: string) {
		super(name.split('/').pop(), vscode.TreeItemCollapsibleState.None, null);
	}

	iconPath = {
		light: path.join(__filename, '..', '..', '..', 'icons', 'file.svg'),
		dark: path.join(__filename, '..', '..', '..', 'icons', 'file.svg')
	};

	public getChildren(): Item[] {
		return [];
	}
}