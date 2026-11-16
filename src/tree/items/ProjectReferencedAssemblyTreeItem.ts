import { TreeItem, TreeItemCollapsibleState, TreeItemContext, ContextValues } from "@tree";
import { Reference } from "@core/Projects";

export class ProjectReferencedAssemblyTreeItem extends TreeItem {
    constructor(context: TreeItemContext, public readonly reference: Reference) {
        super(context, reference.name, TreeItemCollapsibleState.None, ContextValues.projectReferencedAssembly);
        this.allowIconTheme = false;
        this.addContextValueSuffix();
    }
}
