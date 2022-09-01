import { ProjectInSolution } from "@core/Solutions";
import { TreeItem, TreeItemCollapsibleState, TreeItemFactory, TreeItemContext, ContextValues } from "@tree";
import { ProjectReferencesTreeItem } from "./ProjectReferencesTreeItem";

export class ProjectTreeItem extends TreeItem {
    constructor(context: TreeItemContext, projectInSolution: ProjectInSolution) {
        super(context, projectInSolution.projectName, TreeItemCollapsibleState.Collapsed, ContextValues.project, projectInSolution.fullPath, projectInSolution);
        this.allowIconTheme = false;
        this.addContextValueSuffix();
    }

    public refresh(): void {
        this.project?.refresh().then(() => {
            super.refresh()
        });
	}

    protected async createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {
        let result: TreeItem[] = [];
        if (!this.project) {
            return result;
        }

        if (this.project.hasReferences) {
            let references = await this.createReferenceItems(childContext);
            references.forEach(i => result.push(i));
        }

        let items = await TreeItemFactory.createItemsFromProject(childContext, this.project);
        items.forEach(item => result.push(item));

        return result;
    }

    protected createReferenceItems(childContext: TreeItemContext): Promise<TreeItem[]> {
        return Promise.resolve([ new ProjectReferencesTreeItem(childContext) ]);
    }
}
