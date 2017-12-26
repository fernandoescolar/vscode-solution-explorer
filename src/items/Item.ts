import * as vscode from 'vscode';

export default abstract class Item extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly path: string,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
	}

	abstract getChildren(): Item[];
}
