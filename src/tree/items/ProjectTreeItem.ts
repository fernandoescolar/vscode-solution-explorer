import { SolutionItem } from "@core/Solutions";
import { TreeItem, TreeItemCollapsibleState, TreeItemFactory, TreeItemContext, ContextValues } from "@tree";
import { ProjectReferencesTreeItem } from "./ProjectReferencesTreeItem";
import { getOpenProjectOnClick } from "@extensions/config"

export class ProjectTreeItem extends TreeItem {
    constructor(context: TreeItemContext, solutionItem: SolutionItem) {
        super(context, solutionItem.name, TreeItemCollapsibleState.Collapsed, ContextValues.project, solutionItem.fullPath, solutionItem);
        this.allowIconTheme = false;
        this.addContextValueSuffix();

        if (getOpenProjectOnClick()){
            this.command = {
                command: 'solutionExplorer.openFile',
                arguments: [this],
                title: 'Open File'
            };
        }
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
