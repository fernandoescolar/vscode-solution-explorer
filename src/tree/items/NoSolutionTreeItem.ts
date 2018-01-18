import { TreeItem, TreeItemCollapsibleState } from "../TreeItem";
import { ContextValues } from "../ContextValues";
import { TreeItemContext } from "../TreeItemContext";

export class NoSolutionTreeItem extends TreeItem {
    constructor(context: TreeItemContext) {
        super(context, 'No solution found (click to create a new one)', TreeItemCollapsibleState.None, ContextValues.Error, null);
        this.iconPath = null;
    }
}