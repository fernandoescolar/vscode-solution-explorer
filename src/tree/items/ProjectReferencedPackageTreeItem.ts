import { PackageReference } from "@core/Projects";
import { TreeItem, TreeItemCollapsibleState, TreeItemContext, ContextValues } from "@tree";

export class ProjectReferencedPackageTreeItem extends TreeItem {
    constructor(context: TreeItemContext, pkgRef: PackageReference) {
        super(context, pkgRef.name, TreeItemCollapsibleState.None, ContextValues.projectReferencedPackage, pkgRef.name);
        this.description = pkgRef.version;
        this.allowIconTheme = false;
        this.addContextValueSuffix();
    }

    protected loadThemeIcon(fullpath: string): void {
		super.loadThemeIcon(fullpath + ".nupkg");
	}
}
