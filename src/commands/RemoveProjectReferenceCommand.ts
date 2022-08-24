import { ContextValues, TreeItem } from "@tree";
import { Action, RemoveProjectReference } from "@actions";
import { ActionCommand } from "@commands/base";

export class RemoveProjectReferenceCommand extends ActionCommand {
    constructor() {
        super('Remove project reference');
    }

    protected shouldRun(item: TreeItem): boolean {
        return !!item && !!item.project && !!item.path && item.contextValue === ContextValues.projectReferencedPackage + '-cps';
    }

    protected async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.project || !item.path) { return []; }

        return [ new RemoveProjectReference(item.project.fullPath, item.path) ];
    }
}
