import * as vscode from "vscode";
import * as config from "@extensions/config";
import * as sln from "@tree";
import { execSync } from 'child_process';

import { IEventAggregator, EventTypes, IEvent, ISubscription, IFileEvent } from "@events";
import { ILogger } from "@logs";
import { TemplateEngineColletion } from "@templates";
import { SolutionFinder } from "./SolutionFinder";
import { SolutionExplorerDragAndDropController } from "./SolutionExplorerDragAndDropController";
import { SolutionTreeItemCollection } from "./SolutionTreeItemCollection";

export class SolutionExplorerProvider extends vscode.Disposable implements vscode.TreeDataProvider<sln.TreeItem> {
	private fileSubscription: ISubscription | undefined;
	private solutionSubscription: ISubscription | undefined;
	private treeView: vscode.TreeView<sln.TreeItem> | undefined;
	public hasCoreSDK = false;
	private _onDidChangeTreeData: vscode.EventEmitter<sln.TreeItem | undefined> = new vscode.EventEmitter<sln.TreeItem | undefined>();

	constructor(private readonly solutionFinder: SolutionFinder,
		        private readonly solutionTreeItemCollection: SolutionTreeItemCollection,
				private readonly dragAndDropController: SolutionExplorerDragAndDropController,
				private readonly templateEngineCollection: TemplateEngineColletion,
				public readonly eventAggregator: IEventAggregator,
				public readonly logger: ILogger) {

		super(() => this.dispose());
		vscode.window.onDidChangeActiveTextEditor(() => this.onActiveEditorChanged());
		//vscode.window.onDidChangeVisibleTextEditors(data => this.onVisibleEditorsChanged(data));
    }

	public get onDidChangeTreeData(): vscode.Event<sln.TreeItem | undefined> {
		return this._onDidChangeTreeData.event;
	}



	public register() {
		if (!this.solutionFinder) { return; }
		this.solutionFinder.register();

		let showMode = config.getShowMode();
		vscode.commands.executeCommand('setContext', 'solutionExplorer.viewInActivityBar', showMode === config.SHOW_MODE_ACTIVITYBAR);
		vscode.commands.executeCommand('setContext', 'solutionExplorer.viewInExplorer', showMode === config.SHOW_MODE_EXPLORER);
		vscode.commands.executeCommand('setContext', 'solutionExplorer.viewInNone', showMode === config.SHOW_MODE_NONE);
		vscode.commands.executeCommand('setContext', 'solutionExplorer.loadedFlag', !false);

		if (showMode !== config.SHOW_MODE_NONE) {
			const options = {
				treeDataProvider: this,
				dragAndDropController: this.dragAndDropController,
				canSelectMany: true,
				showCollapseAll: true
			};
			this.solutionSubscription = this.eventAggregator.subscribe(EventTypes.solution, evt => this.onSolutionEvent(evt));
			this.fileSubscription = this.eventAggregator.subscribe(EventTypes.file, evt => this.onFileEvent(evt));
			if (showMode === config.SHOW_MODE_ACTIVITYBAR) {
				this.treeView = vscode.window.createTreeView('slnbrw', options);
			} else if (showMode === config.SHOW_MODE_EXPLORER) {
				this.treeView = vscode.window.createTreeView('slnexpl', options);
			}

			try {
				const buffer = execSync('dotnet --version');
				const [majorVersion] = buffer.toString().split('.');
				this.hasCoreSDK = Number(majorVersion) >= 3;
			} catch {}
		}
	}

	public unregister() {
		this.solutionTreeItemCollection.reset();
		this.templateEngineCollection.reset();

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

		this.templateEngineCollection.reset();
		for(let i = 0; i < solutionPaths.length; i++) {
			let s = solutionPaths[i];

			await this.solutionTreeItemCollection.addSolution(s.sln, s.root, this);
			this.templateEngineCollection.createTemplateEngine(s.root);
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

	private onActiveEditorChanged(): void {
		let shouldExecute = config.getTrackActiveItem();
		if (!shouldExecute) { return; }
		if (!vscode.window.activeTextEditor) { return; }
		if (vscode.window.activeTextEditor.document.uri.scheme !== 'file') { return; }

		this.selectActiveDocument();
	}

	private onVisibleEditorsChanged(editors: vscode.TextEditor[]): void {

	}
}
