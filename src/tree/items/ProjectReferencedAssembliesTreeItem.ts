import { t } from "@extensions/translations";
import { Reference } from "@core/Projects";
import { TreeItem, TreeItemCollapsibleState, TreeItemContext, ContextValues } from "@tree";
import { ProjectReferencedAssemblyTreeItem } from "./ProjectReferencedAssemblyTreeItem";
import { ProjectItem, ProjectReference } from "@core/Projects/Items";
import { ProjectReferencedProjectTreeItem } from "./ProjectReferencedProjectTreeItem";

type AnyReference = Reference | ProjectReference

export class ProjectReferencedAssembliesTreeItem extends TreeItem {
    constructor(context: TreeItemContext) {
        super(context, t("assemblies"), TreeItemCollapsibleState.Collapsed, ContextValues.projectReferencedAssemblies);
        this.allowIconTheme = false;
        this.addContextValueSuffix();
    }

    protected async createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {
        const refs = await this.getReferences();

        let result: TreeItem[] = [];
        refs.forEach(ref => {
            if(ref instanceof Reference){
                result.push(this.createReferenceItem(childContext, ref));
            } else if (ref instanceof ProjectReference)
                result.push(this.createProjectReferenceItem(childContext, ref));
        });

        return result;
    }

    private async getReferences(): Promise<AnyReference[]> {
        if (!this.project) {
            return [];
        }
        let refs : AnyReference[] = await this.project.getReferences();
        if(this.project?.type !== "cps")
        {
            //if project isn't cps items will add projectReferences
            refs = refs.concat(await this.project.getProjectReferences());
        }
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
    protected createProjectReferenceItem(childContext: TreeItemContext, ref: ProjectReference) {
        return new ProjectReferencedProjectTreeItem(childContext, ref);
    }

    protected loadThemeIcon(fullpath: string): void {
		super.loadThemeIcon(fullpath + ".vsix");
	}
}
