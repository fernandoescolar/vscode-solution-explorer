import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem } from "@tree";
import { ICommand } from "@commands/base";

export class SelectActiveDocumentCommand implements ICommand {

    constructor(private provider: SolutionExplorerProvider) {
    }

    public run(item: TreeItem): Promise<void> {
        return this.provider.selectActiveDocument();
    }
}
