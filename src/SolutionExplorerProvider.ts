import * as vscode from "vscode";
import * as path from "@extensions/path";
import * as SolutionExplorerConfiguration from "@extensions/config";
import * as sln from "@tree";

import { SolutionFile } from "@core/Solutions";
import { IEventAggregator, EventTypes, IEvent, ISubscription, IFileEvent } from "@events";
import { ILogger, Logger } from "@logs";
import { ITemplateEngine, TemplateEngine } from "@templates";

import { SolutionFinder } from "./SolutionFinder";

export class SolutionExplorerProvider extends vscode.Disposable implements vscode.TreeDataProvider<sln.TreeItem> {
	private _logger: ILogger;
	private _templateEngines: { [id: string]: ITemplateEngine };
	private solutionFinder: SolutionFinder | undefined;
	private fileSubscription: ISubscription | undefined;
	private solutionSubscription: ISubscription | undefined;
	private children: sln.TreeItem[] | undefined;
	private treeView: vscode.TreeView<sln.TreeItem> | undefined;
	private _onDidChangeTreeData: vscode.EventEmitter<sln.TreeItem | undefined> = new vscode.EventEmitter<sln.TreeItem | undefined>();

	constructor(public workspaceRoots: string[], public readonly eventAggregator: IEventAggregator) {
		super(() => this.dispose());
		this.solutionFinder = new SolutionFinder(workspaceRoots, eventAggregator);
		this._logger = new Logger(this.eventAggregator);
		this._templateEngines = {};
		vscode.window.onDidChangeActiveTextEditor(() => this.onActiveEditorChanged());
		//vscode.window.onDidChangeVisibleTextEditors(data => this.onVisibleEditorsChanged(data));
    }

	public get onDidChangeTreeData(): vscode.Event<sln.TreeItem | undefined> {
		return this._onDidChangeTreeData.event;
	}

	public get logger(): ILogger {
		return this._logger;
	}

	public get dropMimeTypes(): string[] {
		return ['application/vnd.code.tree.testViewDragAndDrop'];
	}

	public get dragMimeTypes(): string[] {
		return ['text/uri-list'];
	}

	public getTemplateEngine(name: string): ITemplateEngine {
		return this._templateEngines[name];
	}

	public register() {
		if (!this.solutionFinder) { return; }
		this.solutionFinder.register();

		let showMode = SolutionExplorerConfiguration.getShowMode();
		vscode.commands.executeCommand('setContext', 'solutionExplorer.viewInActivityBar', showMode === SolutionExplorerConfiguration.SHOW_MODE_ACTIVITYBAR);
		vscode.commands.executeCommand('setContext', 'solutionExplorer.viewInExplorer', showMode === SolutionExplorerConfiguration.SHOW_MODE_EXPLORER);
		vscode.commands.executeCommand('setContext', 'solutionExplorer.viewInNone', showMode === SolutionExplorerConfiguration.SHOW_MODE_NONE);
		vscode.commands.executeCommand('setContext', 'solutionExplorer.loadedFlag', !false);
		if (showMode !== SolutionExplorerConfiguration.SHOW_MODE_NONE) {
			this.solutionSubscription = this.eventAggregator.subscribe(EventTypes.solution, evt => this.onSolutionEvent(evt));
			this.fileSubscription = this.eventAggregator.subscribe(EventTypes.file, evt => this.onFileEvent(evt));
			if (showMode === SolutionExplorerConfiguration.SHOW_MODE_ACTIVITYBAR) {
				this.treeView = vscode.window.createTreeView('slnbrw', { treeDataProvider: this, showCollapseAll: true });
			} else if (showMode === SolutionExplorerConfiguration.SHOW_MODE_EXPLORER) {
				this.treeView = vscode.window.createTreeView('slnexpl', { treeDataProvider: this, showCollapseAll: true });
			}
		}
	}

	public unregister() {
		if (this.solutionFinder) {
			this.solutionFinder.dispose();
			this.solutionFinder = undefined;
		}

		if (this.solutionSubscription) {
			this.solutionSubscription.dispose();
			this.solutionSubscription = undefined;
		}

		if (this.fileSubscription) {
			this.fileSubscription.dispose();
			this.fileSubscription = undefined;
		}

		if (this.treeView) {
			this.treeView.dispose();
			this.treeView = undefined;
		}
	}

	public refresh(item?: sln.TreeItem): void {
		if (!item) {
			this.children = undefined;
		}

		this._onDidChangeTreeData.fire(item);
	}

	public getTreeItem(element: sln.TreeItem): vscode.TreeItem {
		return element;
	}

	public getChildren(element?: sln.TreeItem): Thenable<sln.TreeItem[]> | undefined {
		if (!this.workspaceRoots || this.workspaceRoots.length === 0) {
			this.logger.log('No .sln found in workspace');
			return Promise.resolve([]);
		}

		if (element) {
			return element.getChildren();
		}

		if (!element && this.children) {
			return Promise.resolve(this.children);
		}

		if (!element && !this.children) {
			return this.createSolutionItems();
		}
	}

	public getParent(element: sln.TreeItem): sln.TreeItem | undefined {
		return element.parent;
	}

	public async selectFile(filepath: string): Promise<void> {
		if (!this.children) { return; }
		for(let i = 0; i < this.children.length; i++) {
			let result = await this.children[i].search(filepath);
			if (result) {
				this.selectTreeItem(result);
				return;
			}
		}
	}

	public selectActiveDocument(): Promise<void> {
		if (vscode.window.activeTextEditor) {
			return this.selectFile(vscode.window.activeTextEditor.document.uri.fsPath);
		} else {
			return Promise.resolve();
		}
	}

	private selectTreeItem(element: sln.TreeItem): void {
		if (this.treeView && this.treeView.visible) {
			this.treeView.reveal(element, { select: true, focus: false });
		}
	}

	private async createSolutionItems(): Promise<sln.TreeItem[]> {
		this.children = [];
		if (!this.solutionFinder) { return this.children; }

		let solutionPaths = await this.solutionFinder.findSolutions();
		if (solutionPaths.length <= 0 && this.workspaceRoots.length > 0) {
			// return empty to show welcome view
			return [];
		}

		for(let i = 0; i < solutionPaths.length; i++) {
			let s = solutionPaths[i];
			let solution = await SolutionFile.parse(s.sln);
			let item = await sln.TreeItemFactory.createFromSolution(this, solution, s.root);
			this.children.push(item);

			if (!this._templateEngines[s.root]) {
				this._templateEngines[s.root] = new TemplateEngine(s.root);
			}
		}

		if (this.children.length > 0) {
			this.checkTemplatesToInstall();
		}

		return this.children;
	}

	private onFileEvent(event: IEvent): void {
        let fileEvent = <IFileEvent> event;

		if (this.workspaceRoots.indexOf(path.dirname(fileEvent.path)) >= 0
		    && fileEvent.path.endsWith('.sln')) {
			this.children = undefined;
			this.refresh();
        }
	}

	private onSolutionEvent(event: IEvent): void {
		this.children = undefined;
		this.refresh();
	}

	private async checkTemplatesToInstall(): Promise<void> {
		if (!SolutionExplorerConfiguration.getCreateTemplateFolderQuestion()) { return; }
		const templateEnginesToCreate: ITemplateEngine[] = [];
		const keys = Object.keys(this._templateEngines);
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			const exists = await this._templateEngines[key].existsTemplates();
			if (!exists) {
				templateEnginesToCreate.push(this._templateEngines[key]);
			}
		}

		if (templateEnginesToCreate.length > 0) {
			let option = await vscode.window.showWarningMessage("Would you like to create the vscode-solution-explorer templates folder?", 'Yes', 'No');
			if (option !== null && option !== undefined && option === 'Yes') {
				for (let i = 0; i < templateEnginesToCreate.length; i++) {
					await templateEnginesToCreate[i].creteTemplates();
				}
			}
		}
	}

	private onActiveEditorChanged(): void {
		let shouldExecute = SolutionExplorerConfiguration.getTrackActiveItem();
		if (!shouldExecute) { return; }
		if (!vscode.window.activeTextEditor) { return; }
		if (vscode.window.activeTextEditor.document.uri.scheme !== 'file') { return; }

		this.selectActiveDocument();
	}

	private onVisibleEditorsChanged(editors: vscode.TextEditor[]): void {

	}
}
