import fetch from 'node-fetch';
import { TreeItem } from "@tree";
import * as dialogs from '@extensions/dialogs';
import { Action, AddPackageReference } from "@actions";
import { ActionsCommand } from "@commands";

type NugetPackageVersion = { version: string, downloads: number, '@id': string };

type NugetPackage = { id: string, version: string, versions: NugetPackageVersion[], '@id': string};

export class AddPackageCommand extends ActionsCommand {
    private lastNugetPackages: NugetPackage[] = [];
    private wizard: dialogs.Wizard | undefined;
    constructor() {
        super('Add package');
    }

    public  shouldRun(item: TreeItem): boolean {
        return item && !!item.project && item.project.type === 'cps';
    }

    public async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.project) { return []; }

        const services = await this.getNugetApiServices();
        if (!services['SearchQueryService']) {
            return [];
        }
        const searchQueryServiceUrl = services['SearchQueryService'];

        this.wizard = new dialogs.Wizard('Add package')
                                 .searchOption('Search a package', search => this.searchAndMapNugetPackages(searchQueryServiceUrl, search), '')
                                 .selectOption('Select a package', () => this.getCurrentPackageVersions(), () => this.getCurrentPackageDefaultVersion());

        const parameters = await this.wizard.run();
        if (!parameters) {
            return [];
        }

        return [ new AddPackageReference(item.project.fullPath, parameters[0], parameters[1]) ];
    }

    private async getNugetApiServices(): Promise<{[id: string]: string}> {
        const response = await fetch('https://api.nuget.org/v3/index.json');
        const json = await response.json() as any;
        if (!json.resources || json.resources.length === 0) {
            return {};
        }

        const services: {[id: string]: string} = {};
        for (const resource of json.resources) {
            services[resource['@type']] = resource['@id'];
        }

        return services;
    }

    private async searchNugetPackage(searchQueryServiceUrl: string, packageName: string): Promise<NugetPackage[]> {
        const searchUrl = `${searchQueryServiceUrl}?q=${packageName}&skip=0&take=50`;
        const response = await fetch(searchUrl);
        const json = await response.json() as any;
        if (!json.data || json.data.length === 0) {
            return [];
        }

        return json.data;
    }

    private async searchAndMapNugetPackages(searchQueryServiceUrl: string, packageName: string): Promise<string[]> {
        this.lastNugetPackages = await this.searchNugetPackage(searchQueryServiceUrl, packageName);
        return this.lastNugetPackages.map(p => p.id);
    }

    private getCurrentPackageVersions(): Promise<string[]> {
        if (!this.wizard || !this.wizard.context || !this.wizard.context.results) {
            return Promise.resolve([]);
        }

        const nugetPackage = this.lastNugetPackages.find(p => p.id === this.wizard?.context?.results[0]);
        if (!nugetPackage) {
            return Promise.resolve([]);
        }

        return Promise.resolve(nugetPackage.versions.map(v => v.version));
    }

    private getCurrentPackageDefaultVersion(): Promise<string> {
        if (!this.wizard || !this.wizard.context || !this.wizard.context.results) { return Promise.resolve(""); }

        const nugetPackage = this.lastNugetPackages.find(p => p.id === this.wizard?.context?.results[0]);
        if (!nugetPackage) {
            return Promise.resolve("");
        }

        return Promise.resolve(nugetPackage.version);
    }
}
