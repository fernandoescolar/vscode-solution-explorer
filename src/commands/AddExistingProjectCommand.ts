import * as dialogs from "@extensions/dialogs";
import { ContextValues, TreeItem } from "@tree";
import { Action, AddExistingProject } from "@actions";
import { ActionsCommand } from "@commands";

export class AddExistingProjectCommand extends ActionsCommand {
    constructor() {
        super('Add existing project');
    }

    public  shouldRun(item: TreeItem): boolean {
        return item && !!item.path && (item.contextValue === ContextValues.solution || item.contextValue === ContextValues.solution + '-cps');
    }

    public async getActions(item: TreeItem): Promise<Action[]> {
        const projectPath = await dialogs.openProjectFile('Select a project file to add');
        if (!item.path || !projectPath) {
            return [];
        }

        return [ new AddExistingProject(item.path, projectPath) ];
    }
}
