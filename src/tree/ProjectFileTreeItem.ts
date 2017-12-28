import * as vscode from "vscode";
import { TreeItem, TreeItemCollapsibleState } from "./TreeItem";
import { ContextValues } from "./ContextValues";
import { Project } from "../model/Projects";

export class ProjectFileTreeItem extends TreeItem {
    constructor(name: string, path: string, private readonly project: Project, parent: TreeItem) {
        super(name, TreeItemCollapsibleState.None, ContextValues.ProjectFile, parent, path);
    }

    command = {
		command: 'solutionExplorer.openFile',
		arguments: [this.path],
		title: 'Open File'
	};

    public getChildren(): Thenable<TreeItem[]> {
        return Promise.resolve(null);
    }

    public async rename(name: string): Promise<void> {
        return this.project.renameFile(this.path, name);
    }
    
    public delete(): Promise<void> {
        return this.project.deleteFile(this.path);
    }
}