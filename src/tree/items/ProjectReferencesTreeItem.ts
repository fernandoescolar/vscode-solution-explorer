import { TreeItem, TreeItemCollapsibleState, TreeItemContext, ContextValues } from "@tree";
import { ProjectReferencedProjectsTreeItem } from "./ProjectReferencedProjectsTreeItem";
import { ProjectReferencedAssembliesTreeItem } from "./ProjectReferencedAssembliesTreeItem";
import { ProjectReferencedPackagesTreeItem } from "./ProjectReferencedPackagesTreeItem";

export class ProjectReferencesTreeItem extends TreeItem {
    constructor(context: TreeItemContext) {
        super(context, "references", TreeItemCollapsibleState.Collapsed, ContextValues.projectReferences);
        this.allowIconTheme = false;
    }

    protected createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {
        const result: TreeItem[] = [];
        if (this.project?.type === "cps") {
            result.push(new ProjectReferencedProjectsTreeItem(childContext));
        } else {
            result.push(new ProjectReferencedAssembliesTreeItem(childContext));
        }
        result.push(new ProjectReferencedPackagesTreeItem(childContext));

        return Promise.resolve(result);
    }

    protected loadThemeIcon(fullpath: string): void {
		super.loadThemeIcon(fullpath + ".reg");
	}
}
