import * as vscode from "vscode";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem, IRefreshable, isRefreshable } from "../tree";
import { CommandBase } from "./base/CommandBase";

export class RefreshCommand extends CommandBase {

    constructor(private readonly provider: SolutionExplorerProvider) {
        super();
    }

    protected shouldRun(item: TreeItem): boolean {
        return !item || isRefreshable(item);
    }

    protected runCommand(item: TreeItem, args: string[]): Promise<void> {       
        if (item) {
            let refreshable = <IRefreshable> (<any>item);
            refreshable.refresh();
            this.provider.logger.log("Refreshed " + item.path);
        } else {
            this.provider.refresh();
            this.provider.logger.log("Refreshed");
        }

        return Promise.resolve();
    }
}