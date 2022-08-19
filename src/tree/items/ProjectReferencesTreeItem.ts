import { TreeItem, TreeItemCollapsibleState, TreeItemContext, ContextValues } from "@tree";
import { ProjectReferencedProjectsTreeItem } from "./ProjectReferencedProjectsTreeItem";
import { ProjectReferencedPackagesTreeItem } from "./ProjectReferencedPackagesTreeItem";

export class ProjectReferencesTreeItem extends TreeItem {
    constructor(context: TreeItemContext) {
        super(context, "references", TreeItemCollapsibleState.Collapsed, ContextValues.projectReferences);
        this.allowIconTheme = false;
    }

    protected createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {
        let result: TreeItem[] = [];
        result.push(new ProjectReferencedProjectsTreeItem(childContext));
        result.push(new ProjectReferencedPackagesTreeItem(childContext));

        return Promise.resolve(result);
    }

    protected loadThemeIcon(fullpath: string): void {
		super.loadThemeIcon(fullpath + ".reg");
	}
}
