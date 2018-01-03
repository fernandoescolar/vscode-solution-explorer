import { TreeItem, TreeItemCollapsibleState } from "./TreeItem";
import * as TreeItemFactory from "./TreeItemFactory";
import { ContextValues } from "./ContextValues";
import { SolutionFile } from "../model/Solutions";

export class SolutionTreeItem extends TreeItem {
    private children: TreeItem[] = null;
    
    constructor(private readonly solution: SolutionFile) {
        super(solution.Name, TreeItemCollapsibleState.Expanded, ContextValues.Solution);
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
        for (let i = 0; i < this.solution.Projects.length; i++){
            let p = this.solution.Projects[i];
            if (!p.ParentProjectGuid) {
                let item = await TreeItemFactory.CreateFromProject(this, p);
                this.children.push(item);
            }
        }

        return this.children;
    }
}