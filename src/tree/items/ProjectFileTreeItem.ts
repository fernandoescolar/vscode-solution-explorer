import * as vscode from "vscode";
import { TreeItem, TreeItemCollapsibleState, IDeletable, IRenameable } from "../";
import { TreeItemContext } from "../TreeItemContext";
import { ContextValues } from "../ContextValues";
import { Project } from "../../model/Projects";
import { ProjectFile } from "../../model/Projects/ProjectFile";

export class ProjectFileTreeItem extends TreeItem implements IDeletable, IRenameable {
    constructor(context: TreeItemContext, private readonly projectFile: ProjectFile, private readonly project: Project) {
        super(context, projectFile.name, projectFile.hasDependents ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None, ContextValues.ProjectFile, projectFile.fullPath);
    }

    command = {
		command: 'solutionExplorer.openFile',
		arguments: [this],
		title: 'Open File'
	};

    public async rename(name: string): Promise<void> {
        await this.project.renameFile(this.path, name);
        this.parent.refresh();
        return Promise.resolve();
    }
    
    public async delete(): Promise<void> {
        await this.project.deleteFile(this.path);
        this.parent.refresh();
    }

    protected createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {
        let result: TreeItem[] = [];
		if (this.projectFile.dependents) {
            this.projectFile.dependents.forEach(d => {
                result.push(new ProjectFileTreeItem(childContext, d, this.project));
            });
        }

        return Promise.resolve(result);
	}
}