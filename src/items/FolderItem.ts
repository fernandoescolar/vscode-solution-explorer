import * as vscode from 'vscode'
import * as path from 'path'
import Item from './Item'

export default class FolderItem extends Item {
	constructor(name: string, spath: string) {
		super(spath, name, vscode.TreeItemCollapsibleState.Collapsed, spath, []);
	}

	iconPath = {
		light: path.join(__filename, '..', '..', '..', 'icons', 'folder.svg'),
		dark: path.join(__filename, '..', '..', '..', 'icons', 'folder.svg')
	};
}