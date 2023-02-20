import { TreeItem } from "@tree";
import { Action, AddPackageReference } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class UpdatePackagesVersionCommand extends SingleItemActionsCommand {
    constructor() {
        super('UpdatePackagesVersion');
    }

    public shouldRun(item: TreeItem): boolean {
        return !!item && !!item.project;
    }

    public async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.project || !item.project.fullPath) { return []; }

        const references = await item.project.getPackageReferences();
        const project = item.project;
        return references.map(reference => new AddPackageReference(project.fullPath, reference.name));
    }
}
