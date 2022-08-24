import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem } from "@tree";
import { Action, Paste } from "@actions";
import { ActionCommand } from "@commands/base";

export class PasteCommand extends ActionCommand {
    constructor(private readonly provider: SolutionExplorerProvider) {
        super('Paste');
    }

    protected shouldRun(item: TreeItem): boolean {
        if (item && item.path) { return true; }
        return !!item && !!item.path && !!item.project;
    }

    protected getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.path || !item.project) { return Promise.resolve([]); }

        return Promise.resolve([new Paste(item.project, item.path)]);
    }
}
