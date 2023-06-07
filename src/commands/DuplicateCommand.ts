import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import { createCopyName } from "@core/Utilities";
import { ContextValues, TreeItem } from "@tree";
import { Action, CreateProjectFile, OpenFile } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class DuplicateCommand extends SingleItemActionsCommand {
    constructor() {
        super('Duplicate');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
       return !!item && !!item.path && ContextValues.matchAnyLanguage(ContextValues.projectFile, item.contextValue);
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
        if (!item || !item.project || !item.path) { return []; }

        const filepath = await createCopyName(item.path);
        const filename = path.basename(filepath);
        const folder = path.dirname(filepath);
        const content = await fs.readFile(item.path);

        return [
            new CreateProjectFile(item.project, folder, filename, content),
            new OpenFile(filepath)
        ]
    }
}
