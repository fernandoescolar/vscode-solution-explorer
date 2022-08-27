import { TreeItem } from "@tree";
import { Action, InstallWorkspaceTemplateFiles } from "@actions";
import { ActionsCommand } from "@commands";
import { TemplateEngineColletion } from "@templates";

export class InstallWorkspaceTemplateFilesCommand extends ActionsCommand {
    constructor(private readonly templateEngineCollection: TemplateEngineColletion) {
        super('Intall Workspace Template Files');
    }

    public  shouldRun(item: TreeItem): boolean {
       return item && !!item.workspaceRoot;
    }

    public async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.workspaceRoot) { return []; }

        const workspace = item.workspaceRoot;
        return [ new InstallWorkspaceTemplateFiles(this.templateEngineCollection, workspace) ];
    }
}
