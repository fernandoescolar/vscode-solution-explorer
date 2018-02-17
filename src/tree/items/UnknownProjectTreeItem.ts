import { TreeItem, TreeItemCollapsibleState } from "../TreeItem";
import { TreeItemContext } from "../TreeItemContext";
import { ContextValues } from "../ContextValues";
import { ProjectInSolution } from "../../model/Solutions";
import { ErrorTreeItem } from "./ErrorTreeItem";

export class UnknownProjectTreeItem extends TreeItem {

    constructor(context: TreeItemContext, private readonly projectInSolution: ProjectInSolution) {
        super(context, projectInSolution.projectName, TreeItemCollapsibleState.Collapsed, ContextValues.Project, projectInSolution.fullPath);
        this.allowIconTheme = false;
    }

    protected createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {  
        return Promise.resolve([ new ErrorTreeItem(childContext, 'Unknown project type') ]);
    }
}