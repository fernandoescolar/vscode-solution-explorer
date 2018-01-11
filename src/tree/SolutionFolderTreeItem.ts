import { TreeItem, TreeItemCollapsibleState } from "./TreeItem";
import * as TreeItemFactory from "./TreeItemFactory";
import { ContextValues } from "./ContextValues";
import { ProjectInSolution } from "../model/Solutions";
import { IRefreshable } from "./index";

export class SolutionFolderTreeItem extends TreeItem implements IRefreshable {
    private children: TreeItem[] = null;
    
    constructor(private project: ProjectInSolution, parent: TreeItem) {
        super(project.ProjectName, TreeItemCollapsibleState.Expanded, ContextValues.SolutionFolder, parent);
    }

    public getChildren(): Thenable<TreeItem[]> {
        if (this.children != null) {
            return Promise.resolve(this.children);
        }

        return this.createChildren();
    }

    public refresh(): void {
        this.children = null;
    }
    
    private async createChildren(): Promise<TreeItem[]> {
        this.children = [];
        for (let i = 0; i < this.project.Solution.Projects.length; i++){
            let p = this.project.Solution.Projects[i];
            if (p.ParentProjectGuid == this.project.ProjectGuid) {
                let item = await TreeItemFactory.CreateFromProject(this, p);
                this.children.push(item);
            }
        }

        return this.children;
    }
}