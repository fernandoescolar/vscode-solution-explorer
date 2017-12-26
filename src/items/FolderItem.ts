import * as vscode from 'vscode'
import * as path from 'path'
import * as Utilities from '../models/Utilities'
import Item from './Item'

export default class FolderItem extends Item {
	constructor(name: string, folderPath: string) {
		super(name, vscode.TreeItemCollapsibleState.Collapsed, folderPath);
	}

	iconPath = {
		light: path.join(__filename, '..', '..', '..', 'icons', 'folder.svg'),
		dark: path.join(__filename, '..', '..', '..', 'icons', 'folder.svg')
	};

	public getChildren(): Item[] {
		return Utilities.getDirectoryItems(this.path);
	}
}