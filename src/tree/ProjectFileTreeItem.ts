import * as vscode from "vscode";
import { TreeItem, TreeItemCollapsibleState } from "./TreeItem";
import { ContextValues } from "./ContextValues";
import { Project } from "../model/Projects";
import { ProjectFile } from "../model/Projects/ProjectFile";

export class ProjectFileTreeItem extends TreeItem {
    constructor(private readonly projectFile: ProjectFile, private readonly project: Project, parent: TreeItem) {
        super(projectFile.Name, TreeItemCollapsibleState.None, ContextValues.ProjectFile, parent, projectFile.FullPath);
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