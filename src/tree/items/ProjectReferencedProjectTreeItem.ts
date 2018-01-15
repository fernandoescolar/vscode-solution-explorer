import { TreeItem, TreeItemCollapsibleState } from "../TreeItem";
import { ContextValues } from "../ContextValues";
import { ProjectInSolution } from "../../model/Solutions";
import { Project, ProjectReference } from "../../model/Projects";

export class ProjectReferencedProjectTreeItem extends TreeItem {
    constructor(projectReference: ProjectReference, parent: TreeItem) {
        super(projectReference.name, TreeItemCollapsibleState.None, ContextValues.ProjectReferencedProjects, parent);
    }

    public getChildren(): Thenable<TreeItem[]> {
        return Promise.resolve(null);
    }
}