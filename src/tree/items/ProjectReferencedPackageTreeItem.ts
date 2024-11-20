import { PackageReference } from "@core/Projects";
import { TreeItem, TreeItemCollapsibleState, TreeItemContext, ContextValues, TreeItemFactory } from "@tree";

export class ProjectReferencedPackageTreeItem extends TreeItem {
    constructor(context: TreeItemContext, pkgRef: PackageReference, private dependencies: PackageReference[], contextValue: string = ContextValues.projectReferencedPackage) {
        super(
            context,
            pkgRef.name,
            dependencies.length > 0 ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None,
            contextValue,
            pkgRef.name
        );
        this.description = pkgRef.version;
        this.id += pkgRef.version;
        this.allowIconTheme = false;
        this.addContextValueSuffix();
    }

    protected createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {
        return TreeItemFactory.createItemsFromPackages(childContext, this.dependencies, ContextValues.projectReferencedPackageDependency);
    }

    protected loadThemeIcon(fullpath: string): void {
		super.loadThemeIcon(fullpath + ".nupkg");
	}
}
