import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem } from "@tree";
import { Action, SelectActiveDocumentInTree } from "@actions";
import { ActionsCommand } from "@commands";

export class SelectActiveDocumentCommand extends ActionsCommand {
    constructor(private provider: SolutionExplorerProvider) {
        super('Select Active Document')
    }

    public  shouldRun(item: TreeItem): boolean {
        return true;
    }

    public getActions(item: TreeItem): Promise<Action[]> {
        return Promise.resolve([new SelectActiveDocumentInTree(this.provider)]);
    }
}
