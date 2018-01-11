import { TreeItem, TreeItemCollapsibleState } from "./TreeItem";
import { ContextValues } from "./ContextValues";
import { ProjectInSolution } from "../model/Solutions";
import { Project } from "../model/Projects";
import { ProjectReferencedProjectTreeItem } from "./ProjectReferencedProjectTreeItem";
import { IRefreshable } from "./index";

export class ProjectReferencedProjectsTreeItem extends TreeItem implements IRefreshable {
    private children: TreeItem[] = null;

    constructor(private readonly project: Project, parent: TreeItem) {
        super("projects", TreeItemCollapsibleState.Collapsed, ContextValues.ProjectReferencedProjects, parent);
    }

    public getChildren(): Thenable<TreeItem[]> {
        if (this.children) {
            return Promise.resolve(this.children);
        }

        return this.createChildren();
    }

    public refresh(): void {
        this.children = null;
    }
    
    private async createChildren(): Promise<TreeItem[]> {
        this.children = [];
        
        var refs = await this.project.getProjectReferences();
        refs.sort((a, b) => {
            var x = a.Name.toLowerCase();
            var y = b.Name.toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
        });
        refs.forEach(ref => {
            this.children.push(new ProjectReferencedProjectTreeItem(ref, this));
        });

        return this.children;
    }
}