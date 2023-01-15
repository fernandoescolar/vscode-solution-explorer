import { TreeItem } from "@tree";
import { Action } from "@actions";
import { ActionsCommand } from "./ActionsCommand";

export abstract class SingleItemActionsCommand extends ActionsCommand {
    constructor(title: string) {
        super(title);
    }

    public async getActionsBase(clickedItem: TreeItem | undefined, selectedItems: readonly TreeItem[] | undefined): Promise<Action[]> {
        const item = clickedItem ?? (selectedItems?.length === 1 ? selectedItems[0] : undefined);
        return item && this.shouldRun(item) ? this.getActions(item) : [];
    }

    public abstract shouldRun(item: TreeItem): boolean;

    public abstract getActions(item: TreeItem): Promise<Action[]>;
}
