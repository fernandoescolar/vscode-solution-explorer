import * as vscode from "vscode";
import * as TreeItemIconProvider from "./TreeItemIconProvider";
import { IRefreshable, IDisposable } from "./";
import { TreeItemContext } from "./TreeItemContext";

export { TreeItemCollapsibleState, Command } from "vscode";

export abstract class TreeItem extends vscode.TreeItem implements IRefreshable, IDisposable {
	protected children: TreeItem[] = null;

	constructor(
		protected readonly context: TreeItemContext,
		public label: string,
        public collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly contextValue: string,
		public readonly path?: string,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
		this.iconPath = TreeItemIconProvider.findIconPath(label, path, contextValue);
	}

	public get parent(): TreeItem {
		return this.context.parent;
	}

	public async getChildren(): Promise<TreeItem[]> {
        if (!this.children) {
			let childContext = this.context.copy(this);
			this.children = await this.createChildren(childContext);
        }
		
		return this.children;
    }

	public refresh(): void {
		if (this.children) this.children.forEach(c => c.dispose());
        this.children = null;
		this.context.provider.refresh(this);
	}

	public dispose(): void {
		if (this.children) this.children.forEach(c => c.dispose());
        this.children = null;
	}

	protected createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {
		return Promise.resolve([]);
	}
}
