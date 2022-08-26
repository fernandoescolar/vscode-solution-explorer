import * as dialogs from '@extensions/dialogs';
import * as nuget from '@extensions/nuget';
import { TreeItem } from "@tree";
import { Action, AddPackageReference } from "@actions";
import { ActionsCommand } from "@commands";

export class AddPackageCommand extends ActionsCommand {
    private nugetFeeds: nuget.NugetFeed[] = [];
    private lastNugetPackages: nuget.NugetPackage[] = [];
    private wizard: dialogs.Wizard | undefined;
    constructor() {
        super('Add package');
    }

    public  shouldRun(item: TreeItem): boolean {
        return item && !!item.project && item.project.type === 'cps';
    }

    public async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.project) { return []; }

        this.nugetFeeds = await nuget.getNugetFeeds(item.project.fullPath);
        if (this.nugetFeeds.length === 0) {
            const defaultNugetFeed = await nuget.getDefaultNugetFeed();
            this.nugetFeeds = [ defaultNugetFeed ]
        }

        this.wizard = new dialogs.Wizard('Add package')
                                 .selectOption('Select a feed', this.nugetFeeds.map(f => f.name))
                                 .searchOption('Search a package', search => this.searchAndMapNugetPackages(search), '')
                                 .selectOption('Select a package', () => this.getCurrentPackageVersions(), () => this.getCurrentPackageDefaultVersion());

        const parameters = await this.wizard.run();
        if (!parameters) {
            return [];
        }

        return [ new AddPackageReference(item.project.fullPath, parameters[1], parameters[2]) ];
    }

    private async searchAndMapNugetPackages(packageName: string): Promise<string[]> {
        if (!this.wizard || !this.wizard.context || !this.wizard.context.results) {
            return [];
        }

        const feedName = this.wizard.context.results[0];
        const feed = this.nugetFeeds.find(f => f.name === feedName);
        if (!feed) { return []; }

        this.lastNugetPackages = await nuget.searchNugetPackage(feed, packageName);
        return this.lastNugetPackages.map(p => p.id);
    }

    private getCurrentPackageVersions(): Promise<string[]> {
        if (!this.wizard || !this.wizard.context || !this.wizard.context.results) {
            return Promise.resolve([]);
        }

        const nugetPackage = this.lastNugetPackages.find(p => p.id === this.wizard?.context?.results[1]);
        if (!nugetPackage) {
            return Promise.resolve([]);
        }

        return Promise.resolve(nugetPackage.versions.map(v => v.version).reverse());
    }

    private getCurrentPackageDefaultVersion(): Promise<string> {
        if (!this.wizard || !this.wizard.context || !this.wizard.context.results) { return Promise.resolve(""); }

        const nugetPackage = this.lastNugetPackages.find(p => p.id === this.wizard?.context?.results[1]);
        if (!nugetPackage) {
            return Promise.resolve("");
        }

        return Promise.resolve(nugetPackage.version);
    }
}
