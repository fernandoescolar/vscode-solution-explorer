import { TreeItem } from "@tree";
import { Action, ActionContext } from "@actions";
import { ICommand } from "./ICommand";

export abstract class ActionCommand implements ICommand {
    constructor(protected title: string) {
    }

    public async run(item: TreeItem): Promise<void> {
        if (!this.shouldRun(item)) { return; }

        const actions = await this.getActions(item);
        await this.runActions(actions, item);
    }

    protected abstract shouldRun(item: TreeItem): boolean;

    protected abstract getActions(item: TreeItem): Promise<Action[]>;

    protected async runActions(actions: Action[], item: TreeItem): Promise<void> {
        const context: ActionContext = {
            cancelled: false,
            overwriteAll: false,
            keepBothAll: false,
            skipAll: false,
            multipleActions: actions.length > 1
        };

        for (const action of actions) {
            if (context.cancelled) { return; }
            await action.execute(context);
        }
    }
}
