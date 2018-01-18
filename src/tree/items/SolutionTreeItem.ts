import { TreeItem, TreeItemCollapsibleState } from "../TreeItem";
import { TreeItemContext } from "../TreeItemContext";
import { ContextValues } from "../ContextValues";
import { SolutionFile } from "../../model/Solutions";
import * as TreeItemFactory from "../TreeItemFactory";

export class SolutionTreeItem extends TreeItem {    
    constructor(context: TreeItemContext, private readonly solution: SolutionFile) {
        super(context, solution.Name, TreeItemCollapsibleState.Expanded, ContextValues.Solution);
    }
    
    protected async createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {  
        let result: TreeItem[] = [];
        for (let i = 0; i < this.solution.Projects.length; i++){
            let p = this.solution.Projects[i];
            if (!p.parentProjectGuid) {
                let item = await TreeItemFactory.CreateFromProject(childContext, p);
                result.push(item);
            }
        }

        return result;
    }
}