import { TreeItem, TreeItemCollapsibleState } from "../TreeItem";
import { TreeItemContext } from "../TreeItemContext";
import { ContextValues } from "../ContextValues";

export class ErrorTreeItem extends TreeItem {
    constructor(context: TreeItemContext, text: string) {
        super(context, text, TreeItemCollapsibleState.None, ContextValues.Error);
        this.allowIconTheme = false;
    }
}