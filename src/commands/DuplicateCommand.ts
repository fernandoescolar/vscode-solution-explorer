import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import { createCopyName } from "@core/Utilities";
import { ContextValues, TreeItem } from "@tree";
import { Action, CreateProjectFile, OpenFile } from "@actions";
import { ActionCommand } from "@commands/base";

export class DuplicateCommand extends ActionCommand {
    constructor() {
        super('Duplicate');
    }

    protected shouldRun(item: TreeItem): boolean {
       return item && !!item.path && item.contextValue.startsWith(ContextValues.projectFile);
    }

    protected async getActions(item: TreeItem): Promise<Action[]> {
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
