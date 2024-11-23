import { SolutionItem } from "@core/Solutions";
import { TreeItem, TreeItemCollapsibleState, TreeItemContext, ContextValues } from "@tree";
import { ErrorTreeItem } from "./ErrorTreeItem";

export class UnknownProjectTreeItem extends TreeItem {

    constructor(context: TreeItemContext, solutionItem: SolutionItem) {
        super(context, solutionItem.name, TreeItemCollapsibleState.Collapsed, ContextValues.project, solutionItem.fullPath, solutionItem);
        this.allowIconTheme = false;
    }

    protected createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {
        return Promise.resolve([ new ErrorTreeItem(childContext, 'Unknown project type') ]);
    }
}
