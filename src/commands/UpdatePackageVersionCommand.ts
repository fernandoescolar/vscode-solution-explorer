import * as dialogs from '@extensions/dialogs';
import * as nuget from '@extensions/nuget';
import { ContextValues, TreeItem } from "@tree";
import { Action, AddPackageReference } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class UpdatePackageVersionCommand extends SingleItemActionsCommand {
    private nugetFeeds: nuget.NugetFeed[] = [];
    private lastNugetPackages: nuget.NugetPackage[] = [];
    private wizard: dialogs.Wizard | undefined;
    constructor() {
        super('Update Package Version');
    }

    public  shouldRun(item: TreeItem): boolean {
        return !!item && !!item.project && !!item.path && item.contextValue === ContextValues.projectReferencedPackage + '-cps';
    }

    public async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.project || !item.path) { return []; }

        const projectFullPath = item.project.fullPath;
        const packageId = item.path;
        this.wizard = new dialogs.Wizard('Update package version')
                                 .selectOption('Select a feed', () => this.getNugetFeeds(projectFullPath) )
                                 .selectOption('Select a version', 
                                    () => this.getCurrentPackageVersions(packageId),
                                    () => this.getCurrentPackageDefaultVersion(packageId)
                                );

        const parameters = await this.wizard.run();
        if (!parameters) {
            return [];
        }

        return [ new AddPackageReference(item.project.fullPath, packageId, parameters[1]) ];
    }

    private async getNugetFeeds(projectFullPath: string): Promise<string[]> {
        this.nugetFeeds = await nuget.getNugetFeeds(projectFullPath);
        if (this.nugetFeeds.length === 0) {
            const defaultNugetFeed = await nuget.getDefaultNugetFeed();
            this.nugetFeeds = [ defaultNugetFeed ];
        }

        return this.nugetFeeds.map(f => f.name);
    }

    private async searchAndMapNugetPackages(packageId: string): Promise<string[]> {
        if (!this.wizard || !this.wizard.context || !this.wizard.context.results) {
            return [];
        }

        const feedName = this.wizard.context.results[0];
        const feed = this.nugetFeeds.find(f => f.name === feedName);
        if (!feed) { return []; }

        this.lastNugetPackages = await nuget.searchNugetPackage(feed, packageId);
        return this.lastNugetPackages.map(p => p.id);
    }

    private async getCurrentPackageVersions(packageId: string): Promise<string[]> {
        if (this.lastNugetPackages.length === 0) {
            await this.searchAndMapNugetPackages(packageId);
        }

        const nugetPackage = this.lastNugetPackages.find(p => p.id === packageId);
        if (!nugetPackage) {
            return Promise.resolve([]);
        }

        return Promise.resolve(nugetPackage.versions.map(v => v.version).reverse());
    }

    private async getCurrentPackageDefaultVersion(packageId: string): Promise<string> {
        if (this.lastNugetPackages.length === 0) {
            await this.searchAndMapNugetPackages(packageId);
        }

        const nugetPackage = this.lastNugetPackages.find(p => p.id === packageId);
        if (!nugetPackage) {
            return Promise.resolve("");
        }

        return Promise.resolve(nugetPackage.version);
    }
}
