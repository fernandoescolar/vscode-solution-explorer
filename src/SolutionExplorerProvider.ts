import * as vscode from "vscode";
import * as fs from "./async/fs";
import * as path from "path";
import * as sln from "./tree";
import * as SolutionExplorerConfiguration from "./SolutionExplorerConfiguration";
import * as Utilities from "./model/Utilities";
import { SolutionFile } from "./model/Solutions";
import { IEventAggegator, EventTypes, IEvent, ISubscription, IFileEvent } from "./events";
import { ILogger, Logger } from "./log";
import { ITemplateEngine, TemplateEngine } from "./templates";

export class SolutionExplorerProvider extends vscode.Disposable implements vscode.TreeDataProvider<sln.TreeItem> {
	private _logger: ILogger;
	private _templateEngine: ITemplateEngine;
	private subscription: ISubscription = null;
	private children: sln.TreeItem[] = null;
	private treeView: vscode.TreeView<sln.TreeItem> = null;
	private _onDidChangeTreeData: vscode.EventEmitter<sln.TreeItem | undefined> = new vscode.EventEmitter<sln.TreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<sln.TreeItem | undefined> = this._onDidChangeTreeData.event;
	//onDidChangeActiveTextEditor

	constructor(public workspaceRoot: string, public readonly eventAggregator: IEventAggegator) {
		super(() => this.dispose());
		this._logger = new Logger(this.eventAggregator);
		this._templateEngine = new TemplateEngine(workspaceRoot);
		vscode.window.onDidChangeActiveTextEditor(() => this.onActiveEditorChanged());
		vscode.window.onDidChangeVisibleTextEditors(data => this.onVisibleEditorsChanged(data));
	}

	public get logger(): ILogger {
		return this._logger;
	}

	public get templateEngine(): ITemplateEngine {
		return this._templateEngine;
	}

	public register() {
		let showMode = SolutionExplorerConfiguration.getShowMode();
		vscode.commands.executeCommand('setContext', 'solutionExplorer.viewInActivityBar', showMode === SolutionExplorerConfiguration.SHOW_MODE_ACTIVITYBAR);
		vscode.commands.executeCommand('setContext', 'solutionExplorer.viewInExplorer', showMode === SolutionExplorerConfiguration.SHOW_MODE_EXPLORER);
		vscode.commands.executeCommand('setContext', 'solutionExplorer.viewInNone', showMode === SolutionExplorerConfiguration.SHOW_MODE_NONE);
		vscode.commands.executeCommand('setContext', 'solutionExplorer.loadedFlag', !false);

		if (showMode !== SolutionExplorerConfiguration.SHOW_MODE_NONE) {
			this.subscription = this.eventAggregator.subscribe(EventTypes.File, evt => this.onFileEvent(evt))
			if (showMode === SolutionExplorerConfiguration.SHOW_MODE_ACTIVITYBAR) {
				this.treeView = vscode.window.createTreeView('slnbrw', { treeDataProvider: this, showCollapseAll: true });
			} else if (showMode === SolutionExplorerConfiguration.SHOW_MODE_EXPLORER) {
				this.treeView = vscode.window.createTreeView('slnexpl', { treeDataProvider: this, showCollapseAll: true });
			}
		}
	}

	public unregister() {
		if (SolutionExplorerConfiguration.getShowMode() !== SolutionExplorerConfiguration.SHOW_MODE_NONE) {
			this.subscription.dispose();
			this.subscription = null;
			this.treeView.dispose();
			this.treeView = null;
		}
	}

	public refresh(item?: sln.TreeItem): void {
		if (item) {
			this._onDidChangeTreeData.fire(item);
		} else {
			this.children = null;
			this._onDidChangeTreeData.fire();
		}
	}

	public getTreeItem(element: sln.TreeItem): vscode.TreeItem {
		return element;
	}

	public getChildren(element?: sln.TreeItem): Thenable<sln.TreeItem[]> {
		if (!this.workspaceRoot) {
			this.logger.log('No .sln found in workspace');
			return Promise.resolve([]);
		}

		if (element)
			return element.getChildren();

		if (!element && this.children)
			return Promise.resolve(this.children);

		if (!element && !this.children) {
			return this.createSolutionItems();
		}

		return null;
	}

	public getParent(element: sln.TreeItem): sln.TreeItem {
		return element.parent;
	}

	public async selectFile(filepath: string): Promise<void> {
		if (!this.children) return;
		for(let i = 0; i < this.children.length; i++) {
			let result = await this.children[i].search(filepath);
			if (result) {
				this.selectTreeItem(result);
				return;
			}
		}
	}

	private selectTreeItem(element: sln.TreeItem): void {
		if (this.treeView) {
			this.treeView.reveal(element, { select: true, focus: false });
		}
	}

	private async createSolutionItems(): Promise<sln.TreeItem[]> {
		this.children = [];
		let solutionPaths = await Utilities.searchFilesInDir(this.workspaceRoot, '.sln');
		if (solutionPaths.length <= 0) {
			let altFolders = SolutionExplorerConfiguration.getAlternativeSolutionFolders();
			for (let i = 0; i < altFolders.length; i++) {
				let altSolutionPaths = await Utilities.searchFilesInDir(path.join(this.workspaceRoot, altFolders[i]), '.sln');
				solutionPaths = [ ...solutionPaths, ...altSolutionPaths]
			}

			if (solutionPaths.length <= 0) {
				this.children .push(await sln.CreateNoSolution(this, this.workspaceRoot));
				return this.children;
			}
		}

		for(let i = 0; i < solutionPaths.length; i++) {
			let s = solutionPaths[i];
			let solution = await SolutionFile.Parse(s);
			let item = await sln.CreateFromSolution(this, solution);
			this.children.push(item);
		}

		if (this.children.length > 0) this.checkTemplatesToInstall();

		return this.children;
	}

	private onFileEvent(event: IEvent): void {
        let fileEvent = <IFileEvent> event;

		if (path.dirname(fileEvent.path) == this.workspaceRoot
		    && fileEvent.path.endsWith('.sln')) {
			this.children = null;
			this.refresh();
        }
	}

	private async checkTemplatesToInstall(): Promise<void> {
		if (SolutionExplorerConfiguration.getCreateTemplateFolderQuestion() && !(await this.templateEngine.existsTemplates())) {
			let option = await vscode.window.showWarningMessage("Would you like to create the vscode-solution-explorer templates folder?", 'Yes', 'No');
			if (option !== null && option !== undefined && option == 'Yes') {
				await this.templateEngine.creteTemplates();
			}
		}
	}

	private onActiveEditorChanged(): void {
		let shouldExecute = SolutionExplorerConfiguration.getTrackActiveItem();
		if (!shouldExecute) return;
		if (!vscode.window.activeTextEditor) return;
		if (vscode.window.activeTextEditor.document.uri.scheme !== 'file') return;

		this.selectFile(vscode.window.activeTextEditor.document.uri.fsPath);
	}

	private onVisibleEditorsChanged(editors: vscode.TextEditor[]): void {

	}
}








