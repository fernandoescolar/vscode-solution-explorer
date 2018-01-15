import * as vscode from "vscode";
import { TreeItem, TreeItemCollapsibleState } from "../TreeItem";
import { ContextValues } from "../ContextValues";
import { Project } from "../../model/Projects";
import { ProjectFile } from "../../model/Projects/ProjectFile";
import { IDeletable, IRenameable } from "../index";

export class ProjectFileTreeItem extends TreeItem implements IDeletable, IRenameable {
    private children: TreeItem[];

    constructor(private readonly projectFile: ProjectFile, private readonly project: Project, parent: TreeItem) {
        super(projectFile.name, projectFile.hasDependents ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None, ContextValues.ProjectFile, parent, projectFile.fullPath);
    }

    command = {
		command: 'solutionExplorer.openFile',
		arguments: [this],
		title: 'Open File'
	};

    public getChildren(): Thenable<TreeItem[]> {
        if (!this.children && this.projectFile.dependents) {
            this.children = [];
            this.projectFile.dependents.forEach(d => {
                this.children.push(new ProjectFileTreeItem(d, this.project, this));
            });
        }

        return Promise.resolve(this.children);
    }

    public async rename(name: string): Promise<void> {
        return this.project.renameFile(this.path, name);
    }
    
    public delete(): Promise<void> {
        return this.project.deleteFile(this.path);
    }
}