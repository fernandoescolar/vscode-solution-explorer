import { TreeItem, TreeItemCollapsibleState } from "./TreeItem";
import { ContextValues } from "./ContextValues";
import { Project } from "../model/Projects";
import { ProjectReferencedPackageTreeItem } from "./ProjectReferencedPackageTreeItem";
import { IRefreshable } from "./index";

export class ProjectReferencedPackagesTreeItem extends TreeItem implements IRefreshable {
    private children: TreeItem[] = null;

    constructor(private readonly project: Project, parent: TreeItem) {
        super("packages", TreeItemCollapsibleState.Collapsed, ContextValues.ProjectReferencedPackages, parent);
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
        
        var refs = await this.project.getPackageReferences();
        refs.sort((a, b) => {
            var x = a.Name.toLowerCase();
            var y = b.Name.toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
        });
        refs.forEach(ref => {
            this.children.push(new ProjectReferencedPackageTreeItem(ref, this));
        });

        return this.children;
    }
}