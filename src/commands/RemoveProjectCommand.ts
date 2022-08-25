import { ContextValues, TreeItem } from "@tree";
import { Action, RemoveExistingProject } from "@actions";
import { ActionsCommand } from "@commands";

export class RemoveProjectCommand extends ActionsCommand {
    constructor() {
        super('Remove project');
    }

    public  shouldRun(item: TreeItem): boolean {
        return !!item && !!item.project && !!item.path && item.contextValue .startsWith(ContextValues.project);
    }

    public async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.project || !item.path) { return []; }

        return [ new RemoveExistingProject(item.project.fullPath, item.path) ];
    }
}
