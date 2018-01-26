import * as vscode from "vscode";
import * as fs from "./async/fs";
import * as path from "path";
import * as sln from "./tree";
import * as SolutionExplorerConfiguration from "./SolutionExplorerConfiguration";
import * as Utilities from "./model/Utilities";
import { SolutionFile } from "./model/Solutions";
import { IEventAggegator, LogEvent, LogEventType } from "./events";
import { ILogger, Logger } from "./log";

export class SolutionExplorerProvider implements vscode.TreeDataProvider<sln.TreeItem> {
	private _logger: ILogger;
	private children: sln.TreeItem[] = null;
	private _onDidChangeTreeData: vscode.EventEmitter<sln.TreeItem | undefined> = new vscode.EventEmitter<sln.TreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<sln.TreeItem | undefined> = this._onDidChangeTreeData.event;
	//onDidChangeActiveTextEditor

	constructor(private workspaceRoot: string, public readonly eventAggregator: IEventAggegator) {
		this._logger = new Logger(this.eventAggregator);
	}

	public get logger(): ILogger {
		return this._logger;
	}

	public register() {
		if (SolutionExplorerConfiguration.getShowInExplorer())
			vscode.window.registerTreeDataProvider('solutionExplorer', this);
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
		if (!element && !this.children) 
			return this.createSolutionItems();

		return null;
	}

	private async createSolutionItems(): Promise<sln.TreeItem[]> {
		let solutionPaths = await Utilities.searchFilesInDir(this.workspaceRoot, '.sln');
		if (solutionPaths.length <= 0) {
			this.logger.log('No .sln found in workspace');
			return;
		}

		this.children = [];
		for(let i = 0; i < solutionPaths.length; i++) {
			let s = solutionPaths[i];
			let solution = await SolutionFile.Parse(s);
			let item = await sln.CreateFromSolution(this, solution);
			this.children.push(item);
		}

		return this.children;
	}
}








