import { TreeItem, TreeItemCollapsibleState } from "../TreeItem";
import { TreeItemContext } from "../TreeItemContext";
import { ContextValues } from "../ContextValues";
import { ProjectInSolution } from "../../model/Solutions";
import { Project, ProjectReference } from "../../model/Projects";

export class ProjectReferencedProjectTreeItem extends TreeItem {
    constructor(context: TreeItemContext, projectReference: ProjectReference, contextValue?: string) {
        super(context, projectReference.name, TreeItemCollapsibleState.None, ContextValues.ProjectReferencedProject + (contextValue ? '-' + contextValue : ''), projectReference.path);
    }
}