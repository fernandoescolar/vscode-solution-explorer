import { TreeItem } from "@tree";
import { Action } from "@actions";
import { ActionCommandContext, ActionsCommand } from "./ActionsCommand";

export abstract class SingleItemActionsCommand extends ActionsCommand {
    constructor(title: string) {
        super(title);
    }

    public async getActionsBase(ctx: ActionCommandContext): Promise<Action[]> {
        const item = ctx.clickedItem ?? (ctx.selectedItems?.length === 1 ? ctx.selectedItems[0] : undefined);
        return this.shouldRun(item) ? this.getActions(item) : [];
    }

    public abstract shouldRun(item: TreeItem | undefined): boolean;

    public abstract getActions(item: TreeItem | undefined): Promise<Action[]>;
}


