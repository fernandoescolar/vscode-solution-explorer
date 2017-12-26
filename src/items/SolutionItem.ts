import * as vscode from 'vscode'
import * as path from 'path'
import Item from './Item'
import * as Utilities from '../models/Utilities'


export default class SolutionItem extends Item {
	constructor(solutionPath:string) {
		super(solutionPath.split('/').pop().replace('.sln', ''), vscode.TreeItemCollapsibleState.Expanded, solutionPath);
	}

	iconPath = {
		light: path.join(__filename, '..', '..', '..', 'icons', 'sln.svg'),
		dark: path.join(__filename, '..', '..', '..', 'icons', 'sln.svg')
	};

	public getChildren(): Item[] {
		return Utilities.parseSolution(this.path);
	}
}