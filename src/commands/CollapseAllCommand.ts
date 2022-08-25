import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem } from "@tree";
import { Action, CollapseAll } from "@actions";
import { ActionsCommand } from "@commands";

export class CollapseAllCommand extends ActionsCommand {
    constructor(private readonly provider: SolutionExplorerProvider) {
        super('Collapse All');
    }

    public  shouldRun(item: TreeItem): boolean {
        return true;
    }

    public getActions(item: TreeItem): Promise<Action[]> {
        return Promise.resolve([
            new CollapseAll(this.provider)
        ]);
    }
}