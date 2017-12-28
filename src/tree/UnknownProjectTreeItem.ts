import { TreeItem, TreeItemCollapsibleState } from "./TreeItem";
import { ContextValues } from "./ContextValues";
import { ProjectInSolution } from "../model/Solutions";
import { ErrorTreeItem } from "./ErrorTreeItem";

export class UnknownProjectTreeItem extends TreeItem {

    constructor(private readonly project: ProjectInSolution, parent: TreeItem) {
        super(project.ProjectName, TreeItemCollapsibleState.Collapsed, ContextValues.Project, parent, project.FullPath);
    }

    getChildren(): Thenable<TreeItem[]> {
        return Promise.resolve([ new ErrorTreeItem('Unknown project type', this) ]);
    }
}