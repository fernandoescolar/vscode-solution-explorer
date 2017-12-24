import * as vscode from 'vscode';

export default class Item extends vscode.TreeItem {
	constructor(
		public readonly id: string,
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly path: string,
		public children: Item[],
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
	}
}
