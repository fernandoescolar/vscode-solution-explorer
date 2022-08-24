import { ContextValues, TreeItem } from "@tree";
import { Action, RemovePackageReference } from "@actions";
import { ActionCommand } from "@commands/base";

export class RemovePackageCommand extends ActionCommand {
    constructor() {
        super('Remove package');
    }

    protected shouldRun(item: TreeItem): boolean {
        return !!item && !!item.project && !!item.path && item.contextValue === ContextValues.projectReferencedPackage + '-cps';
    }

    protected async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.project || !item.path) { return []; }

        return [ new RemovePackageReference(item.project.fullPath, item.path) ];
    }
}
