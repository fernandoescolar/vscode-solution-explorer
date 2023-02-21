import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem } from "@tree";
import { Action, SelectActiveDocumentInTree } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class SelectActiveDocumentCommand extends SingleItemActionsCommand {
    constructor(private provider: SolutionExplorerProvider) {
        super('Select Active Document')
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return true;
    }

    public getActions(item: TreeItem | undefined): Promise<Action[]> {
        return Promise.resolve([new SelectActiveDocumentInTree(this.provider)]);
    }
}
