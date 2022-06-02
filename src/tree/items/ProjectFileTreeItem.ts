import * as vscode from "vscode";
import { TreeItem, TreeItemCollapsibleState } from "../";
import { TreeItemContext } from "../TreeItemContext";
import { ContextValues } from "../ContextValues";
import { Project } from "../../model/Projects";
import { ProjectFile } from "../../model/Projects/ProjectFile";

export class ProjectFileTreeItem extends TreeItem {
    constructor(context: TreeItemContext, private readonly projectFile: ProjectFile, private readonly relatedFiles: ProjectFile[] = []) {
        super(context, projectFile.name, (projectFile.hasDependents || relatedFiles.length > 0) ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None, ContextValues.ProjectFile, projectFile.fullPath);
    }

    command = {
		command: 'solutionExplorer.openFile',
		arguments: [this],
		title: 'Open File'
	};

    protected createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {
        let result: TreeItem[] = [];
		if (this.projectFile.dependents) {
            this.projectFile.dependents.forEach(d => {
                result.push(new ProjectFileTreeItem(childContext, d));
            });
        }
        if(this.relatedFiles.length > 0) {
            this.relatedFiles.forEach(f => {
                result.push(new ProjectFileTreeItem(this.context, f));
            });
        }

        return Promise.resolve(result);
	}
}