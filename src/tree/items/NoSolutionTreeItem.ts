import { TreeItem, TreeItemCollapsibleState, TreeItemContext, ContextValues } from "@tree";

export class NoSolutionTreeItem extends TreeItem {
    constructor(context: TreeItemContext, rootPath: string) {
        super(context, 'No solution found (right click to create a new one)', TreeItemCollapsibleState.None, ContextValues.noSolution, rootPath);
        this.iconPath = undefined;
    }
}
