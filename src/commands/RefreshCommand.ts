import * as vscode from "vscode";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem } from "../tree";
import { CommandBase } from "./base/CommandBase";

export class RefreshCommand extends CommandBase {

    constructor(private readonly provider: SolutionExplorerProvider) {
        super('Refresh');
    }

    protected shouldRun(item: TreeItem): boolean {
        return true;
    }

    protected runCommand(item: TreeItem, args: string[]): Promise<void> {       
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