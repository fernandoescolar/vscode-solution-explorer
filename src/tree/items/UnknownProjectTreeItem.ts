import { ProjectInSolution } from "@core/Solutions";
import { TreeItem, TreeItemCollapsibleState, TreeItemContext, ContextValues } from "@tree";
import { ErrorTreeItem } from "./ErrorTreeItem";

export class UnknownProjectTreeItem extends TreeItem {

    constructor(context: TreeItemContext, projectInSolution: ProjectInSolution) {
        super(context, projectInSolution.projectName, TreeItemCollapsibleState.Collapsed, ContextValues.project, projectInSolution.fullPath, projectInSolution);
        this.allowIconTheme = false;
    }

    protected createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {
        return Promise.resolve([ new ErrorTreeItem(childContext, 'Unknown project type') ]);
    }
}
