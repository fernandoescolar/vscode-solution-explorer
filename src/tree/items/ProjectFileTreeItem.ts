import * as vscode from "vscode";
import { TreeItem, TreeItemCollapsibleState, IDeletable, IRenameable, IMovable } from "../";
import { TreeItemContext } from "../TreeItemContext";
import { ContextValues } from "../ContextValues";
import { Project } from "../../model/Projects";
import { ProjectFile } from "../../model/Projects/ProjectFile";

export class ProjectFileTreeItem extends TreeItem implements IDeletable, IRenameable, IMovable {
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
    }
    
    public delete(): Promise<void> {
        return this.project.deleteFile(this.path);
    }

    public getFolders(): Promise<string[]> {
        return this.project.getFolderList();
    }

    public move(folderpath: string): Promise<string> {
        return this.project.moveFile(this.path, folderpath);
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