import { TreeItem, TreeItemCollapsibleState } from "../index";
import { TreeItemContext } from "../TreeItemContext";
import { ContextValues } from "../ContextValues";
import { ProjectInSolution } from "../../model/Solutions";
import { Project } from "../../model/Projects";
import { ProjectReferencedProjectTreeItem } from "./ProjectReferencedProjectTreeItem";

export class ProjectReferencedProjectsTreeItem extends TreeItem {
    constructor(context: TreeItemContext, private readonly project: Project) {
        super(context, "projects", TreeItemCollapsibleState.Collapsed, ContextValues.ProjectReferencedProjects);
    }

    protected async createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {  
        var refs = await this.project.getProjectReferences();
        refs.sort((a, b) => {
            var x = a.name.toLowerCase();
            var y = b.name.toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
        });

        let result: TreeItem[] = [];
        refs.forEach(ref => {
            result.push(new ProjectReferencedProjectTreeItem(childContext, ref));
        });

        return result;
    }
}