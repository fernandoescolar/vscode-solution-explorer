import * as vscode from "vscode";
import * as SolutionExplorerConfiguration from "@extensions/config";
import * as sln from "@tree";

import { IEventAggregator, EventTypes, IEvent, ISubscription, IFileEvent } from "@events";
import { ILogger } from "@logs";
import { ITemplateEngine, TemplateEngine } from "@templates";
import { SolutionFinder } from "./SolutionFinder";
import { SolutionExplorerDragAndDropController } from "./SolutionExplorerDragAndDropController";
import { SolutionTreeItemCollection } from "./SolutionTreeItemCollection";

export class SolutionExplorerProvider extends vscode.Disposable implements vscode.TreeDataProvider<sln.TreeItem> {
	private _templateEngines: { [id: string]: ITemplateEngine };
	private fileSubscription: ISubscription | undefined;
	private solutionSubscription: ISubscription | undefined;
	private treeView: vscode.TreeView<sln.TreeItem> | undefined;
	private _onDidChangeTreeData: vscode.EventEmitter<sln.TreeItem | undefined> = new vscode.EventEmitter<sln.TreeItem | undefined>();

	constructor(private readonly solutionFinder: SolutionFinder,
		        private readonly solutionTreeItemCollection: SolutionTreeItemCollection,
				private readonly dragAndDropController: SolutionExplorerDragAndDropController,
				public readonly eventAggregator: IEventAggregator,
				public readonly logger: ILogger) {

		super(() => this.dispose());
		this._templateEngines = {};
		vscode.window.onDidChangeActiveTextEditor(() => this.onActiveEditorChanged());
		//vscode.window.onDidChangeVisibleTextEditors(data => this.onVisibleEditorsChanged(data));
    }

	public get onDidChangeTreeData(): vscode.Event<sln.TreeItem | undefined> {
		return this._onDidChangeTreeData.event;
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
			const options = {
				treeDataProvider: this,
				dragAndDropController: this.dragAndDropController,
				canSelectMany: true,
				showCollapseAll: true
			};
			this.solutionSubscription = this.eventAggregator.subscribe(EventTypes.solution, evt => this.onSolutionEvent(evt));
			this.fileSubscription = this.eventAggregator.subscribe(EventTypes.file, evt => this.onFileEvent(evt));
			if (showMode === SolutionExplorerConfiguration.SHOW_MODE_ACTIVITYBAR) {
				this.treeView = vscode.window.createTreeView('slnbrw', options);
			} else if (showMode === SolutionExplorerConfiguration.SHOW_MODE_EXPLORER) {
				this.treeView = vscode.window.createTreeView('slnexpl', options);
			}
		}
	}

	public unregister() {
		this.solutionTreeItemCollection.reset();

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
			this.solutionTreeItemCollection.reset();
		}

		this._onDidChangeTreeData.fire(item);
	}

	public getTreeItem(element: sln.TreeItem): vscode.TreeItem {
		return element;
	}

	public getChildren(element?: sln.TreeItem): Thenable<sln.TreeItem[]> | undefined {
		if (!this.solutionFinder.hasWorkspaceRoots) {
			this.logger.log('No .sln found in workspace');
			return Promise.resolve([]);
		}

		if (element) {
			return element.getChildren();
		}

		if (!element && this.solutionTreeItemCollection.hasChildren) {
			return Promise.resolve(this.solutionTreeItemCollection.items);
		}

		if (!element && !this.solutionTreeItemCollection.hasChildren) {
			return this.createSolutionItems();
		}
	}

	public getParent(element: sln.TreeItem): sln.TreeItem | undefined {
		return element.parent;
	}

	public async selectFile(filepath: string): Promise<void> {
		if (!this.solutionTreeItemCollection.hasChildren) { return; }
		for(let i = 0; i < this.solutionTreeItemCollection.length; i++) {
			let result = await this.solutionTreeItemCollection.getItem(i).search(filepath);
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
		if (!this.solutionFinder) { return []; }

		let solutionPaths = await this.solutionFinder.findSolutions();
		if (solutionPaths.length <= 0 && this.solutionFinder.hasWorkspaceRoots) {
			// return empty to show welcome view
			return [];
		}

		for(let i = 0; i < solutionPaths.length; i++) {
			let s = solutionPaths[i];

			await this.solutionTreeItemCollection.addSolution(s.sln, s.root, this);

			if (!this._templateEngines[s.root]) {
				this._templateEngines[s.root] = new TemplateEngine(s.root);
			}
		}

		if (this.solutionTreeItemCollection.hasChildren && this.solutionTreeItemCollection.length > 0) {
			this.checkTemplatesToInstall();
		}

		return this.solutionTreeItemCollection.items;
	}

	private onFileEvent(event: IEvent): void {
        let fileEvent = <IFileEvent> event;

		if (this.solutionFinder.isWorkspaceSolutionFile(fileEvent.path)) {
			this.solutionTreeItemCollection.reset();
			this.refresh();
        }
	}

	private onSolutionEvent(event: IEvent): void {
		this.solutionTreeItemCollection.reset();
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
