import { TreeItem, TreeItemCollapsibleState } from "../TreeItem";
import { TreeItemContext } from "../TreeItemContext";
import { ContextValues } from "../ContextValues";
import { ProjectInSolution } from "../../model/Solutions";
import { ErrorTreeItem } from "./ErrorTreeItem";

export class UnknownProjectTreeItem extends TreeItem {

    constructor(context: TreeItemContext, private readonly project: ProjectInSolution) {
        super(context, project.projectName, TreeItemCollapsibleState.Collapsed, ContextValues.Project, project.fullPath);
    }

    protected createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {  
        return Promise.resolve([ new ErrorTreeItem(childContext, 'Unknown project type') ]);
    }
}