import { TreeItem, TreeItemCollapsibleState } from "./TreeItem";
import { ContextValues } from "./ContextValues";
import { ProjectInSolution } from "../model/Solutions";
import { Project } from "../model/Projects";

export class ProjectReferencedProjectTreeItem extends TreeItem {
    constructor(name: string) {
        super(name, TreeItemCollapsibleState.None, ContextValues.ProjectReferencedProjects);
    }

    public getChildren(): Thenable<TreeItem[]> {
        return Promise.resolve(null);
    }
}