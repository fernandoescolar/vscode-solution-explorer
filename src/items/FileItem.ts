import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import Item from './Item'

export default class FileItem extends Item {
	constructor(name: string, filepath: string) {
		super(filepath, name, vscode.TreeItemCollapsibleState.None, filepath, []);

		var extension = filepath.split('.').pop();
		var iconpath = path.join(__filename, '..', '..', '..', 'icons', extension + '.svg');
		if (fs.existsSync(iconpath)) {
			this.iconPath = {
				light: iconpath,
				dark: iconpath
			};
		} else {
			this.iconPath = {
				light: path.join(__filename, '..', '..', '..', 'icons', 'file.svg'),
				dark: path.join(__filename, '..', '..', '..', 'icons', 'file.svg')
			};
		}
	}

	command = {
		command: 'openSolutionItem',
		arguments: [this.path],
		title: 'Open File'
	};
}