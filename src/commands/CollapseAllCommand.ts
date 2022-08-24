import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem } from "@tree";
import { Action, CollapseAll } from "@actions";
import { ActionCommand } from "@commands/base";

export class CollapseAllCommand extends ActionCommand {
    constructor(private readonly provider: SolutionExplorerProvider) {
        super('Collapse All');
    }

    protected shouldRun(item: TreeItem): boolean {
        return true;
    }

    protected getActions(item: TreeItem): Promise<Action[]> {
        return Promise.resolve([
            new CollapseAll(this.provider)
        ]);
    }
}