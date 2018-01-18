import { TreeItem, TreeItemCollapsibleState } from "../TreeItem";
import { ContextValues } from "../ContextValues";
import { Project } from "../../model/Projects";
import { ProjectReferencedProjectsTreeItem } from "./ProjectReferencedProjectsTreeItem";
import { ProjectReferencedPackagesTreeItem } from "./ProjectReferencedPackagesTreeItem";
import { TreeItemContext } from "../TreeItemContext";

export class ProjectReferencesTreeItem extends TreeItem {
    constructor(context: TreeItemContext, private readonly project: Project) {
        super(context, "references", TreeItemCollapsibleState.Collapsed, ContextValues.ProjectReferences);
    }

    protected createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {  
        let result: TreeItem[] = [];
        result.push(new ProjectReferencedProjectsTreeItem(childContext, this.project));
        result.push(new ProjectReferencedPackagesTreeItem(childContext, this.project));

        return Promise.resolve(result);
    }
}