import * as vscode from 'vscode'
import * as path from 'path'
import Item from './Item'

export default class ProjectPackageItem extends Item {
	constructor(name: string, version: string) {
		super(name + " (" + version + ")", vscode.TreeItemCollapsibleState.None, null);
	}

	iconPath = {
		light: path.join(__filename, '..', '..', '..', 'icons', 'packages.svg'),
		dark: path.join(__filename, '..', '..', '..', 'icons', 'packages.svg')
	};

	public getChildren(): Item[] {
		return [];
	}
}