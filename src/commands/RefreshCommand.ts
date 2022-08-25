import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem } from "@tree";
import { ActionsCommand } from "@commands";
import { Action, RefreshTree, RefreshTreeItem } from "@actions";

export class RefreshCommand extends ActionsCommand {
    constructor(private readonly provider: SolutionExplorerProvider) {
        super('Refresh');
    }

    public  shouldRun(item: TreeItem): boolean {
        return true;
    }

    public getActions(item: TreeItem): Promise<Action[]> {
        const result: Action[] = [];
        if (item) {
            result.push(new RefreshTreeItem(item));
        } else {
            result.push(new RefreshTree(this.provider));
        }

        return Promise.resolve(result);
    }
}
