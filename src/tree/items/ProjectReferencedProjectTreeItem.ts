import { TreeItem, TreeItemCollapsibleState, TreeItemContext, ContextValues } from "@tree";
import { ProjectReference } from "@core/Projects";

export class ProjectReferencedProjectTreeItem extends TreeItem {
    constructor(context: TreeItemContext, projectReference: ProjectReference) {
        super(context, projectReference.name, TreeItemCollapsibleState.None, ContextValues.projectReferencedProject, projectReference.relativePath);
        this.allowIconTheme = false;
        this.addContextValueSuffix();
    }
}
