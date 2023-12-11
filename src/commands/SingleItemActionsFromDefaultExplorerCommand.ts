import { Action } from "@actions";
import { ActionCommandContext, ActionsCommand } from "./ActionsCommand";



export abstract class SingleItemActionsFromDefaultExplorerCommand extends ActionsCommand {
    constructor(title: string) {
        super(title);
    }

    public async getActionsBase(ctx: ActionCommandContext): Promise<Action[]> {
        if (!!ctx && !!ctx.args && !!ctx.args.path) {
            return this.shouldRun(ctx.args.path) ? this.getActions(ctx.args.path) : [];
        }

        return [];
    }

    public abstract shouldRun(item: string): boolean;

    public abstract getActions(item: string): Promise<Action[]>;
}
