import { TreeItem, TreeItemCollapsibleState } from "../TreeItem";
import { ContextValues } from "../ContextValues";

export class ErrorTreeItem extends TreeItem {

    constructor(text: string, parent: TreeItem) {
        super(text, TreeItemCollapsibleState.None, ContextValues.Error, parent);
    }

    getChildren(): Thenable<TreeItem[]> {
        return Promise.resolve(null);
    }
}