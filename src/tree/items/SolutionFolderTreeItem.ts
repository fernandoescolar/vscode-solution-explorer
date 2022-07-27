import * as path from "path";
import * as fs from "fs";
import { TreeItem, TreeItemCollapsibleState } from "../TreeItem";
import { TreeItemContext } from "../TreeItemContext";
import * as TreeItemFactory from "../TreeItemFactory";
import { ContextValues } from "../ContextValues";
import { ProjectInSolution } from "../../model/Solutions";

function getPath(context: TreeItemContext, projectInSolution: ProjectInSolution): string {
    const folder = path.join(path.dirname(context.solution.FullPath), projectInSolution.projectName);
    if (fs.existsSync(folder) && fs.statSync(folder).isDirectory()) {
        return folder;
    }

    return null;
}

export class SolutionFolderTreeItem extends TreeItem {
    constructor(context: TreeItemContext, public readonly projectInSolution: ProjectInSolution) {
        super(context, projectInSolution.projectName, TreeItemCollapsibleState.Expanded, ContextValues.SolutionFolder, getPath(context, projectInSolution));
    }

    protected createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {
        return TreeItemFactory.CreateItemsFromSolution(childContext, this.solution, this.projectInSolution);
    }

    public async search(filepath: string): Promise<TreeItem> {
        await this.getChildren();
        for(let i = 0; i < this.children.length; i++) {
            let result = await this.children[i].search(filepath);
            if (result) return result;
        }

		return null;
	}
}