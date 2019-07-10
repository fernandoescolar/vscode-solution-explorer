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
		this.createId();
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

	public id?: string;

	public resourceUri?: vscode.Uri;

	public async getChildren(): Promise<TreeItem[]> {
        if (!this.children) {
			let childContext = this.context.copy(null, this);
			try {
				this.children = await this.createChildren(childContext);
			} catch {
				this.children = [];
			}
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

	public async search(filepath: string): Promise<TreeItem> {
		if (this.path) {
			if (this.path === filepath) return this;

			let dirname = path.dirname(this.path);
			if (filepath.startsWith(dirname)) {
				try {
					await this.getChildren();
				} catch {
					return null;
				}
				for(let i = 0; i < this.children.length; i++) {
					let result = await this.children[i].search(filepath);
					if (result) return result;
				}
			}
		}

		return null;
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

	protected createId(): void {
		let id: string;
		if (this.parent)
			id = this.parent.id + '-' + this.label + '[' + this.contextValue + ']';
		else if (this.solution)
			id = this.solution.FullPath + '[' + this.contextValue + ']';
		else
			id = this.label + '[' + this.contextValue + ']';
		
		this.id = id;
	}

	protected loadIcon(): void {
		let iconType = SolutionExplorerConfiguration.getSolutionExplorerIcons();
		
		if (iconType == SolutionExplorerConfiguration.ICONS_CUSTOM 
		   || (iconType == SolutionExplorerConfiguration.ICONS_MIXED && !this._allowIconTheme)) {
			this.iconPath = TreeItemIconProvider.findIconPath(this.label, this.path, this.contextValue);
		} else {
			let fullpath = this.path;
			if (!fullpath) fullpath = path.dirname(this.solution.FullPath);
			this.loadThemeIcon(fullpath);
		}
	}

	protected loadThemeIcon(fullpath: string): void {
		this.iconPath = this.contextValue.indexOf('folder') >= 0 ? vscode.ThemeIcon.Folder : vscode.ThemeIcon.File;
		this.resourceUri = vscode.Uri.file(fullpath);
	}

	protected containsContextValueChildren(contextValue: string, item?: TreeItem): boolean {
		let result = false;
		if (!item) item = this;
		if (item.contextValue === contextValue) return true;
        if (item.children) {
            item.children.forEach(c => {
				if (this.containsContextValueChildren(contextValue, c)) {
					result = true;
				}
			});
		}
		
		return result;
    }
}
