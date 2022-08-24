import { TreeItem } from "@tree";
import { Action, AddPackageReference } from "@actions";
import { ActionCommand } from "@commands/base";

export class UpdatePackagesVersionCommand extends ActionCommand {
    constructor() {
        super('UpdatePackagesVersion');
    }

    protected shouldRun(item: TreeItem): boolean {
        return !!item && !!item.project;
    }

    protected async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.project || !item.project.fullPath) { return []; }

        const references = await item.project.getPackageReferences();
        const project = item.project;
        return references.map(reference => new AddPackageReference(project.fullPath, reference.name));
    }
}
