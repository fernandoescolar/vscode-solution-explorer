import { TreeItem, TreeItemCollapsibleState } from "./TreeItem";
import { ContextValues } from "./ContextValues";

export class ErrorTreeItem extends TreeItem {

    constructor(text: string) {
        super(text, TreeItemCollapsibleState.None, ContextValues.Error);
    }

    getChildren(): Thenable<TreeItem[]> {
        return Promise.resolve(null);
    }
}