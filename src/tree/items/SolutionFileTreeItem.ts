import { TreeItem, TreeItemCollapsibleState } from "../TreeItem";
import { TreeItemContext } from "../TreeItemContext";
import { ContextValues } from "../ContextValues";
import { ProjectInSolution } from "../../model/Solutions";

export class SolutionFileTreeItem extends TreeItem {   
    constructor(context: TreeItemContext, name: string, filepath: string, public readonly projectInSolution?: ProjectInSolution) {
        super(context, name, TreeItemCollapsibleState.None, ContextValues.SolutionFile, filepath);
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