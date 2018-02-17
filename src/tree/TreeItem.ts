import * as vscode from "vscode";
import * as path from "path";
import * as TreeItemIconProvider from "./TreeItemIconProvider";
import * as SolutionExplorerConfiguration from "../SolutionExplorerConfiguration";
import { TreeItemContext } from "./TreeItemContext";
import { SolutionFile } from "../model/Solutions";
import { Project } from "../model/Projects";

export { TreeItemCollapsibleState, Command } from "vscode";

export abstract class TreeItem extends vscode.TreeItem {
	private _allowIconTheme: boolean = true
	protected children: TreeItem[] = null;

	constructor(
		protected context: TreeItemContext,
		public label: string,
        public collapsibleState: vscode.TreeItemCollapsibleState,
		public contextValue: string,
		public path?: string,
		public command?: vscode.Command,
	) {
		super(label, collapsibleState);
		this.loadIcon();
	}

	public get parent(): TreeItem {
		return this.context.parent;
	}

	public get solution(): SolutionFile {
		return this.context.solution;
	}

	public get project(): Project {
		return this.context.project;
	}

	public get allowIconTheme(): boolean {
		return this._allowIconTheme;
	}

	public set allowIconTheme(val: boolean) {
		this._allowIconTheme = val;
		this.loadIcon();
	}

	public resourceUri?: vscode.Uri;

	public async getChildren(): Promise<TreeItem[]> {
        if (!this.children) {
			let childContext = this.context.copy(null, this);
			this.children = await this.createChildren(childContext);
        }
		
		return this.children;
    }

	public collapse(): void {
		if (this.collapsibleState == vscode.TreeItemCollapsibleState.None) return;
		if (this.children) this.children.forEach(c => c.collapse());
		
		this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
		this.context.provider.refresh(this);
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

	protected addContextValueSuffix(): void {
		this.contextValue += this.project && this.project.type ? '-' + this.project.type : '';
	}

	protected loadIcon(): void {
		if (SolutionExplorerConfiguration.getUseSolutionExplorerIcons() || !this._allowIconTheme) {
			this.iconPath = TreeItemIconProvider.findIconPath(this.label, this.path, this.contextValue);
		} else {
			let fullpath = this.path;
			if (!fullpath) fullpath = path.dirname(this.solution.FullPath);

			this.iconPath = null;
			this.resourceUri = vscode.Uri.parse(fullpath);
		}
	}
}
