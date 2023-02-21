import { TreeItem } from "@tree";
import { Action, InstallWorkspaceTemplateFiles } from "@actions";
import { SingleItemActionsCommand } from "@commands";
import { TemplateEngineCollection } from "@templates";

export class InstallWorkspaceTemplateFilesCommand extends SingleItemActionsCommand {
    constructor(private readonly templateEngineCollection: TemplateEngineCollection) {
        super('Install Workspace Template Files');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
       return !!item && !!item.workspaceRoot;
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
        if (!item || !item.workspaceRoot) { return []; }

        const workspace = item.workspaceRoot;
        return [ new InstallWorkspaceTemplateFiles(this.templateEngineCollection, workspace) ];
    }
}
