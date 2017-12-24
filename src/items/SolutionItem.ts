import * as vscode from 'vscode'
import * as path from 'path'
import Item from './Item'

export default class SolutionItem extends Item {
	constructor(name:string, solutionPath:string, items: Item[]) {
		super(name, name, vscode.TreeItemCollapsibleState.Expanded, solutionPath, items);
	}

	iconPath = {
		light: path.join(__filename, '..', '..', '..', 'icons', 'sln.svg'),
		dark: path.join(__filename, '..', '..', '..', 'icons', 'sln.svg')
	};
}