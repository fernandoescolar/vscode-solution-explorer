import { TreeItem, TreeItemCollapsibleState } from "./TreeItem";
import { ContextValues } from "./ContextValues";
import { ProjectInSolution } from "../model/Solutions";
import { Project } from "../model/Projects";

export class ProjectReferencedProjectTreeItem extends TreeItem {
    constructor(name: string, parent: TreeItem) {
        super(name, TreeItemCollapsibleState.None, ContextValues.ProjectReferencedProjects, parent);
    }

    public getChildren(): Thenable<TreeItem[]> {
        return Promise.resolve(null);
    }
}