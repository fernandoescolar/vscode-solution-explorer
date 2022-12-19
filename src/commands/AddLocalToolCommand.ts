import * as dialogs from '@extensions/dialogs';
import { TreeItem } from "@tree";
import { Action, AddLocalToolReference } from "@actions";
import { AddPackageCommand } from "@commands";

export class AddLocalToolCommand extends AddPackageCommand {
    constructor() {
        super('Add local tool');
    }

    public shouldRun(item: TreeItem): boolean {
        return item && !!item.workspaceRoot;
    }

    public async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.workspaceRoot) { return []; }

        this.wizard = new dialogs.Wizard('Add local dotnet tool')
            .selectOption('Select a feed', () => this.getNugetFeeds(item.workspaceRoot) )
            .searchOption('Search a tool', search => this.searchAndMapNugetPackages(search, 'dotnettool'), '')
            .selectOption('Select a tool', () => this.getCurrentPackageVersions(), () => this.getCurrentPackageDefaultVersion());

        const parameters = await this.wizard.run();
        if (!parameters) {
            return [];
        }

        return [ new AddLocalToolReference(item.workspaceRoot, parameters[1], parameters[2]) ];
    }
}
