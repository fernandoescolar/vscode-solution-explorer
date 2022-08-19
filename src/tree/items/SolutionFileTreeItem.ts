import { ProjectInSolution } from "@core/Solutions";
import { TreeItem, TreeItemCollapsibleState, TreeItemContext, ContextValues } from "@tree";

export class SolutionFileTreeItem extends TreeItem {
    constructor(context: TreeItemContext, name: string, filepath: string, public readonly projectInSolution?: ProjectInSolution) {
        super(context, name, TreeItemCollapsibleState.None, ContextValues.solutionFile, filepath);
    }

    command = {
		command: 'solutionExplorer.openFile',
		arguments: [this],
		title: 'Open File'
	};

    protected createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {
        return Promise.resolve([]);
	}
}
