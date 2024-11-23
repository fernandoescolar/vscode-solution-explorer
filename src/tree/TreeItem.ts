import * as vscode from "vscode";
import * as path from "@extensions/path";
import * as config from "@extensions/config";
import { fasthash } from "@extensions/hash";
import { Solution, SolutionItem } from "@core/Solutions";
import { Project } from "@core/Projects";
import * as TreeItemIconProvider from "./TreeItemIconProvider";
import { TreeItemContext } from "./TreeItemContext";
import { ContextValues } from "./ContextValues";

export { TreeItemCollapsibleState, Command } from "vscode";

export abstract class TreeItem extends vscode.TreeItem {
	private _allowIconTheme: boolean = true;
	protected children: TreeItem[] | null = null;

	constructor(
		protected context: TreeItemContext,
		public label: string,
        public collapsibleState: vscode.TreeItemCollapsibleState,
		public contextValue: string,
		public path?: string,
		public readonly solutionItem?: SolutionItem
	) {
		super(label, collapsibleState);
		this.createId();
		this.loadIcon();
		this.loadResourceUri();
	}

	public command: vscode.Command | undefined;

	public get workspaceRoot(): string {
		return this.context.workspaceRoot;
	}

	public get parent(): TreeItem | undefined {
		return this.context.parent;
	}

	public get solution(): Solution {
		return this.context.solution;
	}

	public get project(): Project | undefined {
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
			let childContext = this.context.copy(undefined, this);
			try {
				this.children = await this.createChildren(childContext);
				// clean duplicated ids
				let ids: string[] = [];
				this.children = this.children.filter(c => {
					const i = c.id || '';
					if (ids.indexOf(i) >= 0) { return false; }
					ids.push(i);
					return true;
				});
			} catch {
				this.children = [];
			}
        }

		return this.children;
    }

	public collapse(): void {
		if (this.collapsibleState === vscode.TreeItemCollapsibleState.None) { return; }
		if (this.children) { this.children.forEach(c => c.collapse()); }

		this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
		this.context.provider.refresh(this);
	}

	public refresh(): void {
		if (this.children) { this.children.forEach(c => c.dispose()); }
        this.children = null;
		this.context.provider.refresh(this);
	}

	public async search(filepath: string): Promise<TreeItem | null> {
		if (this.path) {
			if (this.path === filepath) { return this; }

			try {
				await this.getChildren();
			} catch {
				return null;
			}

			if (this.children) {
				for(let i = 0; i < this.children.length; i++) {
					let result = await this.children[i].search(filepath);
					if (result) { return result; }
				}
			}
		}

		return null;
	}

	public dispose(): void {
		if (this.children) { this.children.forEach(c => c.dispose()); }
        this.children = null;
	}

	protected createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {
		return Promise.resolve([]);
	}

	protected addContextValueSuffix(): void {
		this.contextValue += this.project && this.project.type ? '-' + this.project.type : '';
	}

	protected createId(): void {
		let id: string = `${this.label}-${this.path ?? ''}-${this.contextValue}`;
		if (!this.parent && this.solution) {
			id = this.solution.fullPath + '-' + id;
		}

		id = fasthash(id);
		if (this.parent) {
			id = this.parent.id + '-' + id;
		}

		this.id = id;
	}

	protected loadIcon(): void {
		let iconType = config.getSolutionExplorerIcons();

		if (iconType === "solution-explorer"
		   || (iconType === "mix" && !this._allowIconTheme)) {
			TreeItemIconProvider.findIconPath(this.label, this.path || "", this.contextValue)
			                    .then( iconPath => {
									this.iconPath = iconPath;
									this.context.provider.refresh(this);
								});
		} else {
			let fullpath = this.path;
			if (!fullpath) { fullpath = path.dirname(this.solution.fullPath); }
			//this.resourceUri = vscode.Uri.file(fullpath);
			this.loadThemeIcon(fullpath);
		}
	}

	protected loadThemeIcon(fullpath: string): void {
		this.iconPath = this.contextValue.indexOf('folder') >= 0 ? vscode.ThemeIcon.Folder : vscode.ThemeIcon.File;
	}

	protected loadResourceUri(): void {
		const ignoreTypes = [
			ContextValues.projectReferencedPackage,
			ContextValues.projectReferencedPackageDependency,
			ContextValues.projectReferencedPackages,
			ContextValues.projectReferencedProject,
			ContextValues.projectReferencedProjects,
			ContextValues.projectReferences,
			ContextValues.solutionFolder
		];

		if (ignoreTypes.indexOf(this.contextValue) >= 0) {
			return;
		}

		if (this.path) {
			this.resourceUri = vscode.Uri.file(this.path);
			return;
		}

		if (this.solution && this.solution.fullPath) {
			this.resourceUri = vscode.Uri.file(path.dirname(this.solution.fullPath));
			return;
		}
	}

	protected containsContextValueChildren(contextValue: string, item?: TreeItem): boolean {
		let result = false;
		if (!item) { item = this; }
		if (item.contextValue === contextValue) { return true; }
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
