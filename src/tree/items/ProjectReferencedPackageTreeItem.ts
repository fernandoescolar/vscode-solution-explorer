import { DependencyTree } from 'nuget-deps-tree/dist/src/DependencyTree/Tree';

import { PackageReference } from "@core/Projects";
import { TreeItem, TreeItemCollapsibleState, TreeItemContext, ContextValues } from "@tree";

export class ProjectReferencedPackageTreeItem extends TreeItem {
    constructor(context: TreeItemContext, private pkgRef: PackageReference, private projectNugetDeps: DependencyTree[], contextValue: string = ContextValues.projectReferencedPackage) {
        super(
            context,
            pkgRef.name,
            projectNugetDeps.length > 0 ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None,
            contextValue,
            pkgRef.name
        );
        this.description = pkgRef.version;
        this.allowIconTheme = false;
        this.addContextValueSuffix();
    }

    protected async createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {
        let result: TreeItem[] = [];
        const newContext = this.context.copy(this.context.project, this);
        if (newContext.parent) {
            newContext.parent.id = newContext.parent.id + this.pkgRef.name;
        }
        this.projectNugetDeps.forEach((p) => {
            result.push(
                new ProjectReferencedPackageTreeItem(
                    newContext,
                    new PackageReference(p.id, p.version),
                    p.dependencies,
                    ContextValues.projectReferencedPackageTransitive
                )
            );
        });
        return result;
    }

    protected loadThemeIcon(fullpath: string): void {
		super.loadThemeIcon(fullpath + ".nupkg");
	}
}
