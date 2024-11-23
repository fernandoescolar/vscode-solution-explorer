import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import { SolutionItem, SolutionFolder } from "@core/Solutions";
import { TreeItem, TreeItemCollapsibleState, TreeItemFactory, TreeItemContext, ContextValues } from "@tree";

async function getPath(context: TreeItemContext, solutionItem: SolutionItem): Promise<string | undefined> {
    const folder = path.join(path.dirname(context.solution.fullPath), solutionItem.name);
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
    private constructor(context: TreeItemContext, solutionItem: SolutionItem, path: string | undefined) {
        super(context, solutionItem.name, TreeItemCollapsibleState.Expanded, ContextValues.solutionFolder, path, solutionItem);
    }

    protected createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {
        return TreeItemFactory.createItemsFromSolution(childContext, this.solution, this.solutionItem);
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

    public static async create(context: TreeItemContext, solutionItem: SolutionItem): Promise<SolutionFolderTreeItem> {
        const path = await getPath(context, solutionItem);
        const solutionFolder = new SolutionFolderTreeItem(context, solutionItem, path);
        return solutionFolder;
    }
}
