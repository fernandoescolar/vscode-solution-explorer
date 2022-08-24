import { ContextValues, TreeItem } from "@tree";
import { Action, RemoveExistingProject } from "@actions";
import { ActionCommand } from "@commands/base";

export class RemoveProjectCommand extends ActionCommand {
    constructor() {
        super('Remove project');
    }

    protected shouldRun(item: TreeItem): boolean {
        return !!item && !!item.project && !!item.path && item.contextValue .startsWith(ContextValues.project);
    }

    protected async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.project || !item.path) { return []; }

        return [ new RemoveExistingProject(item.project.fullPath, item.path) ];
    }
}
