import { TreeItem, TreeItemCollapsibleState } from "../TreeItem";
import { ContextValues } from "../ContextValues";
import { TreeItemContext } from "../TreeItemContext";

export class NoSolutionTreeItem extends TreeItem {
    constructor(context: TreeItemContext, rootPath: string) {
        super(context, 'No solution found (right click to create a new one)', TreeItemCollapsibleState.None, ContextValues.NoSolution, rootPath);
        this.iconPath = null;
    }
}