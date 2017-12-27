import * as vscode from 'vscode';
import * as TreeItemIconProvider from './TreeItemIconProvider';

export { TreeItemCollapsibleState, Command } from 'vscode';
export abstract class TreeItem extends vscode.TreeItem {
	constructor(
		public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly contextValue: string,
		public readonly path?: string,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
		this.iconPath = TreeItemIconProvider.findIconPath(label, path, contextValue);
	}

	abstract getChildren(): Thenable<TreeItem[]>;
}
