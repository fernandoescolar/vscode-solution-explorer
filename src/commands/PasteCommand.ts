import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem } from "@tree";
import { Action, Paste } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class PasteCommand extends SingleItemActionsCommand {
    constructor(private readonly provider: SolutionExplorerProvider) {
        super('Paste');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        if (item && item.path) { return true; }
        return !!item && !!item.path && !!item.project;
    }

    public getActions(item: TreeItem | undefined): Promise<Action[]> {
        if (!item || !item.path || !item.project) { return Promise.resolve([]); }

        return Promise.resolve([new Paste(item.project, item.path)]);
    }
}
