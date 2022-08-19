import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import { ProjectInSolution } from "@core/Solutions";
import { TreeItem, TreeItemCollapsibleState, TreeItemFactory, TreeItemContext, ContextValues } from "@tree";

async function getPath(context: TreeItemContext, projectInSolution: ProjectInSolution): Promise<string | undefined> {
    const folder = path.join(path.dirname(context.solution.fullPath), projectInSolution.projectName);
    const exists = await fs.exists(folder);
    if (exists) {
        const isDirectory = await fs.isDirectory(folder);
        if (isDirectory) {
            return folder;
        }
    }

    return undefined;
}

export class SolutionFolderTreeItem extends TreeItem {
    private constructor(context: TreeItemContext, public readonly projectInSolution: ProjectInSolution, path: string | undefined) {
        super(context, projectInSolution.projectName, TreeItemCollapsibleState.Expanded, ContextValues.solutionFolder, path);
    }

    protected createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {
        return TreeItemFactory.createItemsFromSolution(childContext, this.solution, this.projectInSolution);
    }

    public async search(filepath: string): Promise<TreeItem | null> {
        await this.getChildren();
        if (this.children) {
            for(let i = 0; i < this.children.length; i++) {
                let result = await this.children[i].search(filepath);
                if (result) {
                    return result;
                }
            }
        }

		return null;
	}

    public static async create(context: TreeItemContext, projectInSolution: ProjectInSolution): Promise<SolutionFolderTreeItem> {
        const path = await getPath(context, projectInSolution);
        const solutionFolder = new SolutionFolderTreeItem(context, projectInSolution, path);
        return solutionFolder;
    }
}
