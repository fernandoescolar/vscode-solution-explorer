import { TreeItem, ContextValues} from "@tree";
import { Action, DeleteProjectFile, DeleteProjectFolder } from "@actions";
import { ActionCommand } from "@commands/base";

export class DeleteCommand extends ActionCommand {
    constructor() {
        super('Delete');
    }

    protected shouldRun(item: TreeItem): boolean {
        return !!item.project && !!item.path;
    }

    protected async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.project || !item.path) { return []; }

        if (item.contextValue.startsWith(ContextValues.projectFile)) {
            return [ new DeleteProjectFile(item.project, item.path) ];

        } else if (item.contextValue.startsWith(ContextValues.projectFolder)) {
            return [ new DeleteProjectFolder(item.project, item.path) ];
        }

        return [];
    }
}
