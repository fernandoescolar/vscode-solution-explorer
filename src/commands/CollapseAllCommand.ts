import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem } from "@tree";
import { Action, CollapseAll } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class CollapseAllCommand extends SingleItemActionsCommand {
    constructor(private readonly provider: SolutionExplorerProvider) {
        super('Collapse All');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return true;
    }

    public getActions(item: TreeItem | undefined): Promise<Action[]> {
        return Promise.resolve([
            new CollapseAll(this.provider)
        ]);
    }
}