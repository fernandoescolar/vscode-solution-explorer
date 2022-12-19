import * as dialogs from '@extensions/dialogs';
import * as nuget from '@extensions/nuget';
import { TreeItem } from "@tree";
import { Action, AddPackageReference } from "@actions";
import { ActionsCommand } from "@commands";

export class AddPackageCommand extends ActionsCommand {
    protected nugetFeeds: nuget.NugetFeed[] = [];
    protected lastNugetPackages: nuget.NugetPackage[] = [];
    protected wizard: dialogs.Wizard | undefined;
    constructor(title: string = 'Add package') {
        super(title);
    }

    public  shouldRun(item: TreeItem): boolean {
        return item && !!item.project && item.project.type === 'cps';
    }

    public async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.project) { return []; }

        const projectFullPath = item.project.fullPath;
        this.wizard = new dialogs.Wizard('Add package')
                                 .selectOption('Select a feed', () => this.getNugetFeeds(projectFullPath) )
                                 .searchOption('Search a package', search => this.searchAndMapNugetPackages(search), '')
                                 .selectOption('Select a package', () => this.getCurrentPackageVersions(), () => this.getCurrentPackageDefaultVersion());

        const parameters = await this.wizard.run();
        if (!parameters) {
            return [];
        }

        return [ new AddPackageReference(item.project.fullPath, parameters[1], parameters[2]) ];
    }

    protected async getNugetFeeds(projectFullPath: string): Promise<string[]> {
        this.nugetFeeds = await nuget.getNugetFeeds(projectFullPath);
        if (this.nugetFeeds.length === 0) {
            const defaultNugetFeed = await nuget.getDefaultNugetFeed();
            this.nugetFeeds = [ defaultNugetFeed ];
        }

        return this.nugetFeeds.map(f => f.name);
    }

    protected async searchAndMapNugetPackages(packageName: string, packageType: string = ''): Promise<string[]> {
        if (!this.wizard || !this.wizard.context || !this.wizard.context.results) {
            return [];
        }

        const feedName = this.wizard.context.results[0];
        const feed = this.nugetFeeds.find(f => f.name === feedName);
        if (!feed) { return []; }

        this.lastNugetPackages = await nuget.searchNugetPackage(feed, packageName, packageType);
        return this.lastNugetPackages.map(p => p.id);
    }

    protected getCurrentPackageVersions(): Promise<string[]> {
        if (!this.wizard || !this.wizard.context || !this.wizard.context.results) {
            return Promise.resolve([]);
        }

        const nugetPackage = this.lastNugetPackages.find(p => p.id === this.wizard?.context?.results[1]);
        if (!nugetPackage) {
            return Promise.resolve([]);
        }

        return Promise.resolve(nugetPackage.versions.map(v => v.version).reverse());
    }

    protected getCurrentPackageDefaultVersion(): Promise<string> {
        if (!this.wizard || !this.wizard.context || !this.wizard.context.results) { return Promise.resolve(""); }

        const nugetPackage = this.lastNugetPackages.find(p => p.id === this.wizard?.context?.results[1]);
        if (!nugetPackage) {
            return Promise.resolve("");
        }

        return Promise.resolve(nugetPackage.version);
    }
}
