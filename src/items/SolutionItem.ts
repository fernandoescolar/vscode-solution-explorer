import * as vscode from 'vscode'
import * as path from 'path'
import * as Utilities from '../models/Utilities'
import Item from './Item'


export default class SolutionItem extends Item {
	constructor(solutionPath:string) {
		super(solutionPath.split('/').pop().replace('.sln', ''), vscode.TreeItemCollapsibleState.Expanded, solutionPath);
	}

	iconPath = {
		light: path.join(__filename, '..', '..', '..', 'icons', 'sln.svg'),
		dark: path.join(__filename, '..', '..', '..', 'icons', 'sln.svg')
	};

	public getChildren(): Item[] {
		var result = Utilities.parseSolution(this.path);
		result.sort((a, b) => {
			var x = a.label.toLowerCase();
			var y = b.label.toLowerCase();
			return x < y ? -1 : x > y ? 1 : 0;
		});

		return result;
	}
}