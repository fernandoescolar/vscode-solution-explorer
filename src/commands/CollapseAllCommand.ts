import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem } from "@tree";
import { CommandBase } from "@commands/base";

export class CollapseAllCommand extends CommandBase {

    constructor(private readonly provider: SolutionExplorerProvider) {
        super('Collapse All');
    }

    protected shouldRun(item: TreeItem): boolean {
        return true;
    }

    protected async runCommand(item: TreeItem, args: string[]): Promise<void> {
        let items = await this.provider.getChildren();
        if (items && items.length > 0) {
            items.forEach(i => i.collapse());
        }
    }
}