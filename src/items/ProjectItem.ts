import * as vscode from 'vscode'
import * as path from 'path'
import Item from './Item'

export default class ProjectItem extends Item {
	constructor(id:string, name:string, spath:string) {
		super(id, name, vscode.TreeItemCollapsibleState.Collapsed, spath, []);
	}

	iconPath = {
		light: path.join(__filename, '..', '..', '..', 'icons', 'csproj.svg'),
		dark: path.join(__filename, '..', '..', '..', 'icons', 'csproj.svg')
	};
}
