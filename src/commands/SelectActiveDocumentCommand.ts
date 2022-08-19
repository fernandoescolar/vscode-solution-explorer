import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem } from "@tree";
import { CommandBase } from "@commands/base";

export class SelectActiveDocumentCommand extends CommandBase {

    constructor(private readonly provider: SolutionExplorerProvider) {
        super('Select Active Document');
    }

    protected shouldRun(item: TreeItem): boolean {
        return true;
    }

    protected runCommand(item: TreeItem, args: string[]): Promise<void> {
        return this.provider.selectActiveDocument();
    }
}
