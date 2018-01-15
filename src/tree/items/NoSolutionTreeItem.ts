import { TreeItem, TreeItemCollapsibleState } from "../TreeItem";
import { ContextValues } from "../ContextValues";

export class NoSolutionTreeItem extends TreeItem {

    constructor() {
        super('No solution found (click to create a new one)', TreeItemCollapsibleState.None, ContextValues.Error, null);
        this.iconPath = null;
    }

    getChildren(): Thenable<TreeItem[]> {
        return Promise.resolve(null);
    }
}