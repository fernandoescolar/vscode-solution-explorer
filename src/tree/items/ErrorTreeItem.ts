import { TreeItem, TreeItemCollapsibleState, TreeItemContext, ContextValues } from "@tree";

export class ErrorTreeItem extends TreeItem {
    constructor(context: TreeItemContext, text: string) {
        super(context, text, TreeItemCollapsibleState.None, ContextValues.error);
        this.allowIconTheme = false;
    }
}
