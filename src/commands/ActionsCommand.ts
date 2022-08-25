import { TreeItem } from "@tree";
import { Action } from "@actions";

export abstract class ActionsCommand {
    constructor(protected title: string) {
    }

    public abstract shouldRun(item: TreeItem): boolean;

    public abstract getActions(item: TreeItem): Promise<Action[]>;
}
