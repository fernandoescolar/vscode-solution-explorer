import fetch from 'node-fetch';
import { TreeItem } from "@tree";
import * as dialogs from '@extensions/dialogs';
import { Action, AddPackageReference } from "@actions";
import { ActionCommand } from "@commands/base";

type NugetPackageVersion = { version: string, downloads: number, '@id': string };

type NugetPackage = { id: string, version: string, versions: NugetPackageVersion[], '@id': string};

export class AddPackageCommand extends ActionCommand {
    private lastNugetPackages: NugetPackage[] = [];
    constructor() {
        super('Add package');
    }

    protected shouldRun(item: TreeItem): boolean {
        return item && !!item.project && item.project.type === 'cps';
    }

    protected async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.project) { return []; }

        const services = await this.getNugetApiServices();
        if (!services['SearchQueryService']) {
            return [];
        }
        const searchQueryServiceUrl = services['SearchQueryService'];

        const packageId = await dialogs.searchSelectOption('Search a package', '', search => this.searchAndMapNugetPackages(searchQueryServiceUrl, search));
        const nugetPackage = this.lastNugetPackages.find(p => p.id === packageId);
        if (!nugetPackage) {
            return [];
        }

        const version = await dialogs.selectOption('Select a version', nugetPackage.versions.map(v => v.version), nugetPackage.version);
        if (version === undefined) {
            return [];
        }

        return [ new AddPackageReference(item.project.fullPath, nugetPackage.id, version) ];
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
}
