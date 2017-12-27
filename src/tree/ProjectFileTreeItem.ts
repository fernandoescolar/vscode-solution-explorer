import { TreeItem, TreeItemCollapsibleState } from "./TreeItem";
import { ContextValues } from "./ContextValues";
import { Project } from "../model/Projects";

export class ProjectFileTreeItem extends TreeItem {
    constructor(name: string, path: string, private readonly project: Project) {
        super(name, TreeItemCollapsibleState.None, ContextValues.ProjectFile, path);
    }

    command = {
		command: 'openSolutionItem',
		arguments: [this.path],
		title: 'Open File'
	};

    public getChildren(): Thenable<TreeItem[]> {
        return Promise.resolve(null);
    }
}