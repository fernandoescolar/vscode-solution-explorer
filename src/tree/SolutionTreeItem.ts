import { TreeItem, TreeItemCollapsibleState } from "./TreeItem";
import * as TreeItemFactory from './TreeItemFactory';
import { ContextValues } from './ContextValues';
import { SolutionFile } from '../model/Solutions';

export class SolutionTreeItem extends TreeItem {
    private children: TreeItem[] = null;
    
    constructor(private readonly solution: SolutionFile) {
        super(solution.Name, TreeItemCollapsibleState.Expanded, ContextValues.Solution);
    }

    public getChildren(): Thenable<TreeItem[]> {
        if (this.children != null) {
            return Promise.resolve(this.children);
        }

        this.children = [];
        this.solution.Projects.forEach(p => {
            if (!p.ParentProjectGuid) this.children.push(TreeItemFactory.CreateFromProject(p));
        });

        return Promise.resolve(this.children);
    }
}