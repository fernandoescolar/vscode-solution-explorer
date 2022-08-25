import { ContextValues, TreeItem } from "@tree";
import { Action, RemoveProjectReference } from "@actions";
import { ActionsCommand } from "@commands";

export class RemoveProjectReferenceCommand extends ActionsCommand {
    constructor() {
        super('Remove project reference');
    }

    public  shouldRun(item: TreeItem): boolean {
        return !!item && !!item.project && !!item.path && item.contextValue === ContextValues.projectReferencedPackage + '-cps';
    }

    public async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.project || !item.path) { return []; }

        return [ new RemoveProjectReference(item.project.fullPath, item.path) ];
    }
}
