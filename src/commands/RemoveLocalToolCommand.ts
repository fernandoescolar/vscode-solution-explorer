import { TreeItem } from "@tree";
import { Action, RemoveLocalToolReference } from "@actions";
import { ActionsCommand } from "@commands";

export class RemoveLocalToolCommand extends ActionsCommand {
    constructor() {
        super('Remove local tool');
    }

    public shouldRun(item: TreeItem): boolean {
        return !!item && !!item.workspaceRoot && !!item.path;
    }

    public async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.workspaceRoot || !item.path) { return []; }

        return [ new RemoveLocalToolReference(item.workspaceRoot, item.path) ];
    }
}
