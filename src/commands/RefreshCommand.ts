import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem } from "@tree";
import { ICommand } from "@commands/base";

export class RefreshCommand implements ICommand {
    constructor(private readonly provider: SolutionExplorerProvider) {
    }

    public run(item: TreeItem): Promise<void> {
        if (item) {
            item.refresh();
            this.provider.logger.log("Refreshed " + item.path);
        } else {
            this.provider.refresh();
            this.provider.logger.log("Refreshed");
        }

        return Promise.resolve();
    }
}
