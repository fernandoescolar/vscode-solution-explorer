import { t } from "@extensions/translations";
import { TreeItem, TreeItemCollapsibleState, TreeItemContext, ContextValues } from "@tree";
import { ProjectReferencedProjectsTreeItem } from "./ProjectReferencedProjectsTreeItem";
import { ProjectReferencedAssembliesTreeItem } from "./ProjectReferencedAssembliesTreeItem";
import { ProjectReferencedPackagesTreeItem } from "./ProjectReferencedPackagesTreeItem";
import { ReferenceType } from "@core/Projects/ReferenceType";

export class ProjectReferencesTreeItem extends TreeItem {
    constructor(context: TreeItemContext) {
        super(context, t("references"), TreeItemCollapsibleState.Collapsed, ContextValues.projectReferences);
        this.allowIconTheme = false;
    }

    protected async createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {
        const result: TreeItem[] = [];
        if (this.project?.type === "cps") {
            result.push(new ProjectReferencedProjectsTreeItem(childContext));
        }
        if(ReferenceType.hasFlag((await this.project?.getReferenceTypes()) ?? ReferenceType.None, ReferenceType.Reference) || this.project?.type !== "cps") {
            result.push(new ProjectReferencedAssembliesTreeItem(childContext));
        }
        result.push(new ProjectReferencedPackagesTreeItem(childContext));
        return result;
    }

    protected loadThemeIcon(fullpath: string): void {
		super.loadThemeIcon(fullpath + ".reg");
	}
}
