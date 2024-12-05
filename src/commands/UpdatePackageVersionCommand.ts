import * as dialogs from '@extensions/dialogs';
import * as nuget from '@extensions/nuget';
import { ContextValues, TreeItem } from "@tree";
import { Action, DotNetAddPackageReference } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class UpdatePackageVersionCommand extends SingleItemActionsCommand {
    private wizard: dialogs.Wizard | undefined;
    constructor() {
        super('Update Package Version');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return !!item && !!item.project && !!item.path && item.contextValue === ContextValues.projectReferencedPackage + '-cps';
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
        if (!item || !item.project || !item.path) { return []; }

        const projectFullPath = item.project.fullPath;
        const packageId = item.path;
        const version = item.description?.toString() || '';
        this.wizard = new dialogs.Wizard('Update package version')
                                 .selectOption('Select a version',
                                    () => nuget.searchPackageVersions(projectFullPath, packageId),
                                    version,
                                );

        const parameters = await this.wizard.run();
        if (!parameters) {
            return [];
        }
        const parameterVersion = parameters.length > 1 ? parameters[1] : parameters[0];
        return [ new DotNetAddPackageReference(item.project.fullPath, packageId, parameterVersion) ];
    }
}
