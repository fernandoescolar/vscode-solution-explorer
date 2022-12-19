import fetch, { RequestInit } from "node-fetch";
import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import * as xml from "@extensions/xml";

export type NugetPackageVersion = { version: string, downloads: number, '@id': string };

export type NugetPackage = { id: string, version: string, versions: NugetPackageVersion[], '@id': string};

export type NugetFeed = { name: string, url: string, searchApiUrl: string, userName?: string, password?: string };

export async function getDefaultNugetFeed(): Promise<NugetFeed> {
    const defaultFeed: NugetFeed = {
        name: "Nuget.org",
        url: "https://api.nuget.org/v3/index.json",
        searchApiUrl: ""
    };

    await fillFeedSearchUrl(defaultFeed);

    return defaultFeed;
}

export async function getNugetFeeds(projectPath: string): Promise<NugetFeed[]> {
    const result: NugetFeed[] = [];
    do {
        projectPath = path.dirname(projectPath);
        const nugetConfigPath = `${projectPath}/nuget.config`;
        const exists = await fs.exists(nugetConfigPath);
        if (exists) {
            try {
                const nugetConfig = await fs.readFile(nugetConfigPath);
                const nugetConfigJson = await xml.parseToJson(nugetConfig);
                if (nugetConfigJson) {
                    const configuration = nugetConfigJson.elements?.find((e: xml.XmlElement) => e.name === "configuration");
                    if (configuration) {
                        const packageSources = configuration.elements?.find((e: xml.XmlElement) => e.name === "packageSources");
                        const packageSourceCredentials = configuration.elements?.find((e: xml.XmlElement) => e.name === "packageSourceCredentials");
                        if (packageSources) {
                            const feeds = packageSources.elements?.filter( (e: xml.XmlElement) => e.name === "add");
                            if (feeds && feeds.length > 0) {
                                for (const f of feeds) {
                                    const name = f.attributes?.key;
                                    const url = f.attributes?.value;
                                    if (!name || !url) { continue; }

                                    let userName: string | undefined;
                                    let password: string | undefined;
                                    if (packageSourceCredentials) {
                                        const credentials = packageSourceCredentials.elements?.find((e: xml.XmlElement) => e.name === name);
                                        if (credentials) {
                                            userName = credentials.elements?.find((e: xml.XmlElement) => e.name === "add" && e.attributes.key === "Username")?.attributes?.value;
                                            password = credentials.elements?.find((e: xml.XmlElement) => e.name === "add" && e.attributes.key === "ClearTextPassword")?.attributes?.value;
                                        }
                                    }

                                    if (result.findIndex(f => f.name === name) < 0) {
                                        const feed: NugetFeed = { name, url, searchApiUrl: '', userName, password };
                                        result.push(feed);
                                    }
                                }
                            }
                        }
                    }
                }
            } catch {
                break;
            }
        }
    } while (projectPath && projectPath !== path.dirname(projectPath));

    return result;
}

export async function getNugetApiServices(feed: NugetFeed): Promise<{[id: string]: string}> {
    try {
        const response = await fetch(feed.url, getFetchOptions(feed));
        const json = await response.json() as any;
        if (!json.resources || json.resources.length === 0) {
            return {};
        }

        const services: {[id: string]: string} = {};
        for (const resource of json.resources) {
            services[resource['@type']] = resource['@id'];
        }

        return services;
    } catch(ex) {
        return {};
    }
}

export async function searchNugetPackage(feed: NugetFeed, packageName: string, packageType: string): Promise<NugetPackage[]> {
    if (!feed) {
        return [];
    }

    if (!feed.searchApiUrl) {
        await fillFeedSearchUrl(feed);
    }

    if (!feed.searchApiUrl) {
        throw new Error(`Nuget search API URL is not found for feed ${feed.name}`);
    }

    const searchUrl = `${feed.searchApiUrl}?q=${packageName}&skip=0&take=50&packageType=${packageType}`;
    const response = await fetch(searchUrl, getFetchOptions(feed));
    const json = await response.json() as any;
    if (!json.data || json.data.length === 0) {
        return [];
    }

    return json.data;
}

async function fillFeedSearchUrl(feed: NugetFeed): Promise<void> {
    const service = await getNugetApiServices(feed);
    const serviceKey = Object.keys(service).find((s: string) => s.startsWith("SearchQueryService"));
    if (serviceKey) {
        feed.searchApiUrl = service[serviceKey];
    }
}

function getFetchOptions(feed: NugetFeed): RequestInit {
    const options: RequestInit = { method: "GET" };
    if (feed.userName || feed.password) {
        const token = btoa(`${feed.userName || ""}:${feed.password || ""}`);
        options.headers = { Authorization: `Basic ${token}` }
    }

    return options;
}