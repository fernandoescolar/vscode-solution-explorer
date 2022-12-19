import { PackageReference } from "@core/Projects";
import { TreeItem, TreeItemCollapsibleState, TreeItemContext, ContextValues } from "@tree";

export class LocalToolTreeItem extends TreeItem {
    constructor(context: TreeItemContext, pkgRef: PackageReference) {
        super(context, pkgRef.name, TreeItemCollapsibleState.None, ContextValues.localTool, pkgRef.name);
        this.description = pkgRef.version;
        this.allowIconTheme = false;
    }

    protected loadThemeIcon(fullpath: string): void {
        super.loadThemeIcon(fullpath + ".nupkg");
    }
}
