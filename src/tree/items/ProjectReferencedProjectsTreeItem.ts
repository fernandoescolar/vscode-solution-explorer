import { ProjectReference } from "@core/Projects";
import { TreeItem, TreeItemCollapsibleState, TreeItemContext, ContextValues } from "@tree";
import { ProjectReferencedProjectTreeItem } from "./ProjectReferencedProjectTreeItem";

export class ProjectReferencedProjectsTreeItem extends TreeItem {
    constructor(context: TreeItemContext) {
        super(context, "projects", TreeItemCollapsibleState.Collapsed, ContextValues.projectReferencedProjects);
        this.allowIconTheme = false;
        this.addContextValueSuffix();
    }

    protected async createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {
        const refs = await this.getProjectReferences();

        let result: TreeItem[] = [];
        refs.forEach(ref => {
            result.push(this.createProjectReferenceItem(childContext, ref));
        });

        return result;
    }

    private async getProjectReferences(): Promise<ProjectReference[]> {
        if (!this.project) {
            return [];
        }

        const refs = await this.project.getProjectReferences();
        refs.sort((a, b) => {
            const x = a.name.toLowerCase();
            const y = b.name.toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
        });

        return refs;
    }

    protected createProjectReferenceItem(childContext: TreeItemContext, ref: ProjectReference) {
        return new ProjectReferencedProjectTreeItem(childContext, ref);
    }

    protected loadThemeIcon(fullpath: string): void {
		super.loadThemeIcon(fullpath + ".vsix");
	}
}
