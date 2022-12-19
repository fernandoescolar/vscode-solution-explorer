import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { SolutionFile } from "@core/Solutions";
import { TreeItem, TreeItemFactory } from "@tree";
import { LocalTools } from "@core/Utilities/LocalTools";

export class SolutionTreeItemCollection {
	private children: TreeItem[] | undefined = undefined;

	public get length(): number {
		return this.children ? this.children.length : 0;
	}

	public get hasChildren(): boolean {
		return this.children !== undefined;
	}

	public get items(): TreeItem[] {
		return this.children || [];
	}

	public getItem(index: number): TreeItem {
		if (!this.children || !this.children[index]) { throw new Error("Invalid index in SolutionItemCollection"); }
		return this.children[index];
	}

	public reset(): void {
		this.children = undefined;
	}

	public async addSolution(solutionPath: string, rootPath: string, solutionProvider: SolutionExplorerProvider): Promise<void> {
		if (!this.children) {
			this.children = [];
		}

		const solution = await SolutionFile.parse(solutionPath);
		const solutionItem = await TreeItemFactory.createFromSolution(solutionProvider, solution, rootPath);

		if (solutionProvider.hasCoreSDK) {
			const localTools = LocalTools.getInstalledLocalTools(rootPath);
			const localToolsItem = await TreeItemFactory.createFromLocalTools(solutionProvider, solution, rootPath, localTools);
			this.children.push(localToolsItem);
		}

		this.children.push(solutionItem);
	}

	public getLoadedChildTreeItemById(id: string): TreeItem | undefined {
		if (!this.children) { return undefined; }
		return SolutionTreeItemCollection.getInternalLoadedChildTreeItemById(id, this.children);
	}

	private static getInternalLoadedChildTreeItemById(id: string, children: TreeItem[]): TreeItem | undefined  {
        for (const child of children) {
            if (!child) {
                continue;
            }

            if (child.id === id) {
                return child;
            }

            const found = SolutionTreeItemCollection.getInternalLoadedChildTreeItemById(id, (child as any).children || []);
            if (found) {
                return found;
            }
        }

        return undefined;
    }
}
