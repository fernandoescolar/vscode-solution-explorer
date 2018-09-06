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

export class SolutionExplorerProvider implements vscode.TreeDataProvider<sln.TreeItem> {
	private _logger: ILogger;
	private _workspaceFolders: vscode.WorkspaceFolder[];
	private _templateEngines: Map<string, ITemplateEngine>;
	private subscription: ISubscription = null;
	private children: sln.TreeItem[] = null;
	private treeView: vscode.TreeView<sln.TreeItem> = null;
	private _onDidChangeTreeData: vscode.EventEmitter<sln.TreeItem | undefined> = new vscode.EventEmitter<sln.TreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<sln.TreeItem | undefined> = this._onDidChangeTreeData.event;
	//onDidChangeActiveTextEditor

	constructor(public workspaceFolders: vscode.WorkspaceFolder[], public readonly eventAggregator: IEventAggegator) {
		this._logger = new Logger(this.eventAggregator);
		this._workspaceFolders = workspaceFolders;
		this._templateEngines = this._workspaceFolders.reduce((map, folder) => {
			map[folder.name] = new TemplateEngine(folder.name, folder.uri.path);
			return map;
		}, new Map<string, ITemplateEngine>());
		vscode.window.onDidChangeActiveTextEditor(() => this.onActiveEditorChanged());
		vscode.window.onDidChangeVisibleTextEditors(data => this.onVisibleEditorsChanged(data));
	}

	public get logger(): ILogger {
		return this._logger;
	}

	public get defaultTemplateEngine(): ITemplateEngine {
		return this._templateEngines[0];
	}

	public templateEngine(workspaceName: string): ITemplateEngine {
		return this._templateEngines[workspaceName];
	}

	public register() {
		let showMode = SolutionExplorerConfiguration.getShowMode();
		vscode.commands.executeCommand('setContext', 'solutionExplorer.loadedFlag', !false);
		vscode.commands.executeCommand('setContext', 'solutionExplorer.viewInActivityBar', showMode === SolutionExplorerConfiguration.SHOW_MODE_ACTIVITYBAR);
		vscode.commands.executeCommand('setContext', 'solutionExplorer.viewInExplorer', showMode === SolutionExplorerConfiguration.SHOW_MODE_EXPLORER);
		vscode.commands.executeCommand('setContext', 'solutionExplorer.viewInNone', showMode === SolutionExplorerConfiguration.SHOW_MODE_NONE);
		
		if (showMode !== SolutionExplorerConfiguration.SHOW_MODE_NONE) {
			this.subscription = this.eventAggregator.subscribe(EventTypes.File, evt => this.onFileEvent(evt))
			this.treeView = vscode.window.createTreeView('solutionExplorer', { treeDataProvider: this });
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
		if (!this._workspaceFolders || this._workspaceFolders.length == 0) {
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

	private async selectFile(filepath: string): Promise<void> {
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
			this.treeView.reveal(element);
		}
	}

	private async createSolutionItems(): Promise<sln.TreeItem[]> {
		this.children = [];
		let solutionPaths = await this._workspaceFolders.reduce(async (_paths, folder) => (await _paths).concat(await Utilities.searchFilesInDir(folder.uri.path, '.sln')), Promise.resolve(new Array<string>()));
		if (solutionPaths.length <= 0) {
			let altFolders = SolutionExplorerConfiguration.getAlternativeSolutionFolders();
			for (let i = 0; i < altFolders.length; i++) {
				let altSolutionPaths = await this._workspaceFolders.reduce(async (_paths, folder) => (await _paths).concat(await Utilities.searchFilesInDir(path.join(folder.uri.path, altFolders[i]), '.sln')), Promise.resolve(new Array<string>()));
				solutionPaths = [ ...solutionPaths, ...altSolutionPaths]
			}
			
			if (solutionPaths.length <= 0) {
				this.children.push(await sln.CreateNoSolution(this, this._workspaceFolders[0].uri.path));
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

		if (this._workspaceFolders.find(f => f.uri.path != path.dirname(fileEvent.path)) == null 
		    && fileEvent.path.endsWith('.sln')) {
			this.children = null;
			this.refresh();
        }
	}

	private async checkTemplatesToInstall(): Promise<void> {
		for (const templateEngine of this._templateEngines.values()) {
			if (!(await templateEngine.existsTemplates())) {
				let option = await vscode.window.showWarningMessage("Would you like to create the vscode-solution-explorer templates folder?", 'Yes', 'No');
				if (option !== null && option !== undefined && option == 'Yes') {
					await templateEngine.createTemplates();
				}
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








