import { PackageReference } from "@core/Projects";
import { TreeItem, TreeItemContext, TreeItemCollapsibleState, ContextValues } from "@tree";
import { ProjectReferencedPackageTreeItem } from "./ProjectReferencedPackageTreeItem";

export class ProjectReferencedPackagesTreeItem extends TreeItem {
    constructor(context: TreeItemContext) {
        super(context, "packages", TreeItemCollapsibleState.Collapsed, ContextValues.projectReferencedPackages);
        this.allowIconTheme = false;
        this.addContextValueSuffix();
    }

    protected async createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {
        const refs = await this.getReferences();
        let result: TreeItem[] = [];
        refs.forEach(ref => {
            result.push(this.createReferencePackageItem(childContext, ref));
        });

        return result;
    }

    protected async getReferences(): Promise<PackageReference[]> {
        if (!this.project) {
            return [];
        }

        const refs = await this.project.getPackageReferences();
        refs.sort((a, b) => {
            const x = a.name.toLowerCase();
            const y = b.name.toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
        });

        return refs;
    }

    protected createReferencePackageItem(childContext: TreeItemContext, ref: PackageReference) {
        const deps = (this.context.project?.getNugetPackagesDependencyTree()?.dependencies || [])
            .find(d => d.id === ref.name)
            ?.dependencies || []
        return new ProjectReferencedPackageTreeItem(childContext, ref, deps);
    }

    protected loadThemeIcon(fullpath: string): void {
		super.loadThemeIcon(fullpath + ".pkg");
	}
}
