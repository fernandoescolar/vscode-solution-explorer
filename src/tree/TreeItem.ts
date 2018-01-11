import * as vscode from "vscode";
import * as TreeItemIconProvider from "./TreeItemIconProvider";

export { TreeItemCollapsibleState, Command } from "vscode";
export abstract class TreeItem extends vscode.TreeItem {
	constructor(
		public label: string,
        public collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly contextValue: string,
		public parent?: TreeItem,
		public path?: string,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
		this.iconPath = TreeItemIconProvider.findIconPath(label, path, contextValue);
	}

	public abstract getChildren(): Thenable<TreeItem[]>;
}
