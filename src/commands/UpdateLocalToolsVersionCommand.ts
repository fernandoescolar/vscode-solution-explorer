import { Action, UpdateLocalToolReference } from "@actions";
import { ActionsCommand } from "@commands";
import { LocalToolsTreeItem } from "@tree/items/LocalToolsTreeItem";

export class UpdateLocalToolsVersionCommand extends ActionsCommand {
    constructor() {
        super('UpdateLocalToolsVersion');
    }

    public shouldRun(item: LocalToolsTreeItem): boolean {
        return !!item && !!item.workspaceRoot;
    }

    public async getActions(item: LocalToolsTreeItem): Promise<Action[]> {
        if (!item || !item.workspaceRoot) { return []; }

        const references = item.getLocalTools();
        return references.map(reference => new UpdateLocalToolReference(item.workspaceRoot, reference.name));
    }
}
