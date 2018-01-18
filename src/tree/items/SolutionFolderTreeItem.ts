import { TreeItem, TreeItemCollapsibleState } from "../TreeItem";
import { TreeItemContext } from "../TreeItemContext";
import * as TreeItemFactory from "../TreeItemFactory";
import { ContextValues } from "../ContextValues";
import { ProjectInSolution } from "../../model/Solutions";

export class SolutionFolderTreeItem extends TreeItem {   
    constructor(context: TreeItemContext, private project: ProjectInSolution) {
        super(context, project.projectName, TreeItemCollapsibleState.Expanded, ContextValues.SolutionFolder);
    }

    protected async createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {  
        let result: TreeItem[] = [];
        for (let i = 0; i < this.project.solution.Projects.length; i++){
            let p = this.project.solution.Projects[i];
            if (p.parentProjectGuid == this.project.projectGuid) {
                let item = await TreeItemFactory.CreateFromProject(childContext, p);
                result.push(item);
            }
        }

        return result;
    }
}