import { TreeItem, TreeItemCollapsibleState, TreeItemContext, ContextValues } from "@tree";
import { Reference } from "@core/Projects";

export class ProjectReferencedAssemblyTreeItem extends TreeItem {
    constructor(context: TreeItemContext, projectReference: Reference) {
        super(context, projectReference.name, TreeItemCollapsibleState.None, ContextValues.projectReferencedProject);
        this.allowIconTheme = false;
        this.addContextValueSuffix();
    }
}
