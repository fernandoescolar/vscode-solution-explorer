import { ContextValues, TreeItem } from "@tree";
import { Action, RemovePackageReference } from "@actions";
import { ActionsCommand } from "@commands";

export class RemovePackageCommand extends ActionsCommand {
    constructor() {
        super('Remove package');
    }

    public  shouldRun(item: TreeItem): boolean {
        return !!item && !!item.project && !!item.path && item.contextValue === ContextValues.projectReferencedPackage + '-cps';
    }

    public async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.project || !item.path) { return []; }

        return [ new RemovePackageReference(item.project.fullPath, item.path) ];
    }
}
