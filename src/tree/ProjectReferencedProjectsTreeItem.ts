import { TreeItem, TreeItemCollapsibleState } from "./TreeItem";
import { ContextValues } from "./ContextValues";
import { ProjectInSolution } from "../model/Solutions";
import { Project } from "../model/Projects";
import { ProjectReferencedProjectTreeItem } from "./ProjectReferencedProjectTreeItem";

export class ProjectReferencedProjectsTreeItem extends TreeItem {
    private children: TreeItem[] = null;

    constructor(private readonly project: Project) {
        super("projects", TreeItemCollapsibleState.Collapsed, ContextValues.ProjectReferencedProjects);
    }

    public getChildren(): Thenable<TreeItem[]> {
        if (this.children) {
            return Promise.resolve(this.children);
        }

        this.children = [];
        var refs = this.project.getProjectReferences();
        refs.sort((a, b) => {
            var x = a.toLowerCase();
            var y = b.toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
        });
        refs.forEach(ref => {
            this.children.push(new ProjectReferencedProjectTreeItem(ref));
        });

        return Promise.resolve(this.children);
    }
}