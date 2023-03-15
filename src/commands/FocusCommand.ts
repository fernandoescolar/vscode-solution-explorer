import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem } from "@tree";
import { Action, Focus } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class FocusCommand extends SingleItemActionsCommand {
    constructor(private provider: SolutionExplorerProvider) {
        super('Focus');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return true;
    }

    public getActions(item: TreeItem | undefined): Promise<Action[]> {
        return Promise.resolve([new Focus(this.provider)]);
    }
}
