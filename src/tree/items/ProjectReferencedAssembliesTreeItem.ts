import { Reference } from "@core/Projects";
import { TreeItem, TreeItemCollapsibleState, TreeItemContext, ContextValues } from "@tree";
import { ProjectReferencedAssemblyTreeItem } from "./ProjectReferencedAssemblyTreeItem";

export class ProjectReferencedAssembliesTreeItem extends TreeItem {
    constructor(context: TreeItemContext) {
        super(context, "assemblies", TreeItemCollapsibleState.Collapsed, ContextValues.projectReferencedProjects);
        this.allowIconTheme = false;
        this.addContextValueSuffix();
    }

    protected async createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {
        const refs = await this.getReferences();

        let result: TreeItem[] = [];
        refs.forEach(ref => {
            result.push(this.createReferenceItem(childContext, ref));
        });

        return result;
    }

    private async getReferences(): Promise<Reference[]> {
        if (!this.project) {
            return [];
        }

        const refs = await this.project.getReferences();
        refs.sort((a, b) => {
            const x = a.name.toLowerCase();
            const y = b.name.toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
        });

        return refs;
    }

    protected createReferenceItem(childContext: TreeItemContext, ref: Reference) {
        return new ProjectReferencedAssemblyTreeItem(childContext, ref);
    }

    protected loadThemeIcon(fullpath: string): void {
		super.loadThemeIcon(fullpath + ".vsix");
	}
}
