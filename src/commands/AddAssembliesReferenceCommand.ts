import { t } from "@extensions/translations";
import * as dialogs from "@extensions/dialogs";
import { ContextValues, TreeItem } from "@tree";
import { Action, AddAssemblyReference, RefreshTreeItem } from "@actions";
import { SingleItemActionsCommand } from "@commands";
import { SolutionExplorerProvider } from "@SolutionExplorerProvider";

export class AddAssembliesReferenceCommand extends SingleItemActionsCommand {
    constructor(private readonly provider: SolutionExplorerProvider) {
        super('Add existing dlls to project');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return true;
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
        const project = item?.project;
        if (!project) { return []; }

        const referencePaths = await dialogs.openReferenceFile(t('Select assemblies to add'));
        if (!referencePaths?.length) { return []; }

        return [...referencePaths.map(path => new AddAssemblyReference(project, path)), new RefreshTreeItem(item)];
    }
}
