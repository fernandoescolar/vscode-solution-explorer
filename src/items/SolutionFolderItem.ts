import * as vscode from 'vscode'
import * as path from 'path'
import Item from './Item'

export default class SolutionFolderItem extends Item {
	constructor(id:string, name: string) {
		super(id, name, vscode.TreeItemCollapsibleState.Expanded, null, []);
	}

	iconPath = {
		light: path.join(__filename, '..', '..', '..', 'icons', 'folder.svg'),
		dark: path.join(__filename, '..', '..', '..', 'icons', 'folder.svg')
	};
}
