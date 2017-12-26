import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'
import Item from './Item'

export default abstract class ProjectItem extends Item {
	constructor(name: string, projectPath:string) {
		super(name, vscode.TreeItemCollapsibleState.Collapsed, projectPath);

		this.folderPath = path.dirname(projectPath);

		var extension = projectPath.split('.').pop();
		var iconpath = path.join(__filename, '..', '..', '..', 'icons', extension + '.svg');
		if (fs.existsSync(iconpath)) {
			this.iconPath = {
				light: iconpath,
				dark: iconpath
			};
		} else {
			this.iconPath = {
				light: path.join(__filename, '..', '..', '..', 'icons', 'csproj.svg'),
				dark: path.join(__filename, '..', '..', '..', 'icons', 'csproj.svg')
			};
		}
	}

	public folderPath: string;
}
