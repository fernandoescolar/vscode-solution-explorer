import * as vscode from "vscode";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem, IRefreshable, isRefreshable } from "../tree";
import { CommandBase } from "./base/CommandBase";

export class RefreshCommand extends CommandBase {

    constructor(private readonly provider: SolutionExplorerProvider) {
        super();
    }

    protected ShouldRun(item: TreeItem): boolean {
        return !item || isRefreshable(item);
    }

    protected RunCommand(item: TreeItem, args: string[]): Promise<string[]> {       
        if (item) {
            let refreshable = <IRefreshable> (<any>item);
            refreshable.refresh();
            this.provider.refresh(item);
        } else {
            this.provider.refresh();
        }

        return Promise.resolve([]);
    }
}