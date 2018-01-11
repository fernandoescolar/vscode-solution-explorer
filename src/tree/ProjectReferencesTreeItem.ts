import { TreeItem, TreeItemCollapsibleState } from "./TreeItem";
import { ContextValues } from "./ContextValues";
import { Project } from "../model/Projects";
import { ProjectReferencedProjectsTreeItem } from "./ProjectReferencedProjectsTreeItem";
import { ProjectReferencedPackagesTreeItem } from "./ProjectReferencedPackagesTreeItem";
import { IRefreshable } from "./index";

export class ProjectReferencesTreeItem extends TreeItem implements IRefreshable {
    private children: TreeItem[] = null;

    constructor(private readonly project: Project, parent: TreeItem) {
        super("references", TreeItemCollapsibleState.Collapsed, ContextValues.ProjectReferences, parent);
    }

    public getChildren(): Thenable<TreeItem[]> {
        if (this.children) {
            return Promise.resolve(this.children);
        }

        this.children = [];
        this.children.push(new ProjectReferencedProjectsTreeItem(this.project, this));
        this.children.push(new ProjectReferencedPackagesTreeItem(this.project, this));

        return Promise.resolve(this.children);
    }

    public refresh(): void {
        this.children = null;
	}
}