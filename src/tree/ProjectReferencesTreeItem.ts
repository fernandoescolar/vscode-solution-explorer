import { TreeItem, TreeItemCollapsibleState } from "./TreeItem";
import { ContextValues } from "./ContextValues";
import { Project } from "../model/Projects";
import { ProjectReferencedProjectsTreeItem } from "./ProjectReferencedProjectsTreeItem";
import { ProjectReferencedPackagesTreeItem } from "./ProjectReferencedPackagesTreeItem";

export class ProjectReferencesTreeItem extends TreeItem {
    private children: TreeItem[] = null;

    constructor(private readonly project: Project) {
        super("references", TreeItemCollapsibleState.Collapsed, ContextValues.ProjectReferences);
    }

    public getChildren(): Thenable<TreeItem[]> {
        if (this.children) {
            return Promise.resolve(this.children);
        }

        this.children = [];
        this.children.push(new ProjectReferencedProjectsTreeItem(this.project));
        this.children.push(new ProjectReferencedPackagesTreeItem(this.project));

        return Promise.resolve(this.children);
    }
}