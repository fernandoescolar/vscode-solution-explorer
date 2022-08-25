import { TreeItem } from "@tree";
import { Action, ActionContext } from "./base/Action";

export class RefreshTreeItem implements Action {
    constructor(private readonly treeItem: TreeItem) {
    }

    public execute(context: ActionContext): Promise<void> {
        if (!context.cancelled) {
            this.treeItem.refresh();
        }

        return Promise.resolve();
    }

    public toString(): string {
        return `Refresh Tree Item ${this.treeItem.label}`;
    }
}
