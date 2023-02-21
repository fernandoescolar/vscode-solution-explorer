import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem } from "@tree";
import { SingleItemActionsCommand } from "@commands";
import { Action, RefreshTree, RefreshTreeItem } from "@actions";

export class RefreshCommand extends SingleItemActionsCommand {
    constructor(private readonly provider: SolutionExplorerProvider) {
        super('Refresh');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return true;
    }

    public getActions(item: TreeItem | undefined): Promise<Action[]> {
        const result: Action[] = [];
        if (item) {
            result.push(new RefreshTreeItem(item));
        } else {
            result.push(new RefreshTree(this.provider));
        }

        return Promise.resolve(result);
    }
}
