import fetch, { RequestInit } from "node-fetch";
import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import * as xml from "@extensions/xml";
import * as config from "@extensions/config";


const maxCacheTime = 1000 * 60 * 30; // 30 minutes
const feedsCache: {[url: string]: { feeds: NugetFeed[], time: Date } } = {};
const versionsCache: {[id: string]: { versions: string[], time: Date } } = {};

export type NugetPackageVersion = { version: string, downloads: number, '@id': string };

export type NugetPackage = { id: string, version: string, description: string, versions: NugetPackageVersion[], '@id': string};

export type NugetFeed = { name: string, url: string, searchApiUrl: string, userName?: string, password?: string, packageVersionsUrl: string };

export async function getDefaultNugetFeed(): Promise<NugetFeed> {
    const defaultFeed: NugetFeed = {
        name: "Nuget.org",
        url: "https://api.nuget.org/v3/index.json",
        searchApiUrl: "",
        packageVersionsUrl: "",
    };

    await fillUrls(defaultFeed);

    return defaultFeed;
}

export async function getNugetFeeds(projectPath: string): Promise<NugetFeed[]> {
    const cached = feedsCache[projectPath];
    if (cached && new Date().getTime() - cached.time.getTime() < maxCacheTime) {
        return cached.feeds;
    }

    cleanCache();

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

                                    const existing = result.find(f => f.name === name);
                                    if (!existing) {
                                        const feed: NugetFeed = { name, url, searchApiUrl: '', packageVersionsUrl: '', userName, password };
                                        result.push(feed);
                                    } else {
                                        if (!existing.url) {
                                            existing.url = url;
                                            existing.searchApiUrl = '';
                                            existing.packageVersionsUrl = '';
                                        }
                                        if (!existing.userName) {
                                            existing.userName = userName;
                                        }
                                        if (!existing.password) {
                                            existing.password = password;
                                        }
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

    if (result.length === 0) {
        result.push(await getDefaultNugetFeed());
    }

    feedsCache[projectPath] = { feeds: result, time: new Date() };
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

export async function searchNugetPackage(feed: NugetFeed, packageName: string): Promise<NugetPackage[]> {
    if (!feed) {
        return [];
    }

    if (!feed.searchApiUrl) {
        await fillUrls(feed);
    }

    if (!feed.searchApiUrl) {
        throw new Error(`Nuget search API URL is not found for feed ${feed.name}`);
    }

    const searchUrl = `${feed.searchApiUrl}?q=${packageName}&skip=0&take=50`;
    const response = await fetch(searchUrl, getFetchOptions(feed));
    const json = await response.json() as any;
    if (!json.data || json.data.length === 0) {
        return [];
    }

    return json.data;
}

export async function getNugetPackageVersions(feed: NugetFeed, packageName: string): Promise<string[]> {
    if (!feed) {
        return [];
    }

    if (!feed.packageVersionsUrl) {
        await fillUrls(feed);
    }

    if (!feed.packageVersionsUrl) {
        throw new Error(`Nuget package versions URL is not found for feed ${feed.name}`);
    }

    const searchUrl = `${feed.packageVersionsUrl}${packageName.toLocaleLowerCase()}/index.json`;
    const response = await fetch(searchUrl, getFetchOptions(feed));
    if (!response.ok) {
        return [];
    }
    const json = await response.json() as any;
    if (!json.versions || json.versions.length === 0) {
        return [];
    }

    return json.versions;
}


async function fillUrls(feed: NugetFeed): Promise<void> {
    const service = await getNugetApiServices(feed);
    const serviceKey = Object.keys(service).find((s: string) => s.startsWith("SearchQueryService"));
    if (serviceKey) {
        feed.searchApiUrl = service[serviceKey];
    }

    const packageVersionsKey = Object.keys(service).find((s: string) => s.startsWith("PackageBaseAddress"));
    if (packageVersionsKey) {
        feed.packageVersionsUrl = service[packageVersionsKey];
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

export async function searchPackagesByName(projectPath: string, query: string): Promise<NugetPackage[]> {
    const feeds = await getNugetFeeds(projectPath);
    const promises = feeds.map(feed => searchNugetPackage(feed, query).then(packages => packages).catch(() => []));
    const results = await Promise.all(promises);
    const packages = results.flatMap(result => result);
    return packages.reduce((acc, pkg) => {
        if (acc.some(p => p.id === pkg.id)) {
            return acc;
        }
        return [...acc, pkg];
    }, Array<NugetPackage>());
}

export async function searchPackageVersions(projectPath: string, id: string, includePreRelease: boolean | undefined = undefined): Promise<string[]> {
    let uniqueVersions = [];
    if (versionsCache[id] && new Date().getTime() - versionsCache[id].time.getTime() < maxCacheTime) {
        uniqueVersions = versionsCache[id].versions;
    } else {
        const feeds = await getNugetFeeds(projectPath);
        const promises = feeds.map(feed => getNugetPackageVersions(feed, id).then(versions => versions).catch(() => []));
        const results = await Promise.all(promises);
        const versions = results.flatMap(result => result);
        uniqueVersions = Array.from(new Set(versions));
        if (uniqueVersions && uniqueVersions.length !== 0) {
            versionsCache[id] = { versions: uniqueVersions, time: new Date() };
        }
    }

    includePreRelease = includePreRelease === undefined ? config.getNugetIncludePrerelease() : includePreRelease;
    if (!includePreRelease) {
        uniqueVersions = uniqueVersions.filter(v => !v.includes("-"));
    }

    const orderedVersions = uniqueVersions.sort(comparePackageVersions);

    cleanCache();
    return orderedVersions;
}

/**
   * Semantic versioning compare
   */
export function comparePackageVersions(a: string, b: string): number
{
  const aParts = splitVersion(a);
  const bParts = splitVersion(b);
  const length = Math.min(aParts.length, bParts.length);

  for (let i = 0; i < length; i++) {
      const cmp = cmpPart(aParts[i], bParts[i])
      if (cmp === 0) {
          continue;
      }

      return cmp;
  }

  return length === 3
    ? aParts.length - bParts.length
    : bParts.length - aParts.length;

  function cmpPart(a: string, b: string): number
  {
    if (a === b) {
      return 0;
    }

    if (!a) {
      return 1;
    }

    if (!b) {
      return -1;
    }

    const aNumber = Number(a);
    const bNumber = Number(b);
    if (!isNaN(aNumber) && !isNaN(bNumber)) {
      return bNumber - aNumber;
    }

    return b > a ? 1 : -1;
  }

  function splitVersion(version: string): string[]
  {
    const metaDataIndex = version.indexOf("+");
    const preReleaseIndex = version.indexOf("-");

    let versionParts = version.substr(0, preReleaseIndex < 0 ? undefined : preReleaseIndex).split(".");

    if (versionParts.length !== 3) {
      versionParts.push("0");
    }
    if (versionParts.length !== 3) {
      versionParts.push("0");
    }

    if (preReleaseIndex >= 0) {
      const preReleasePart = version.substr(preReleaseIndex + 1, metaDataIndex < 0 ? undefined : metaDataIndex - preReleaseIndex - 1).split(".");
      versionParts = versionParts.concat(preReleasePart);
    }

    return versionParts;
  }
}

export function invalidateCache() {
    for (const key in feedsCache) {
        delete feedsCache[key];
    }

    for (const key in versionsCache) {
        delete versionsCache[key];
    }
}

async function cleanCache() {
    for (const key in feedsCache) {
        if (new Date().getTime() - feedsCache[key].time.getTime() > maxCacheTime) {
            delete feedsCache[key];
        }
    }

    for (const key in versionsCache) {
        if (new Date().getTime() - versionsCache[key].time.getTime() > maxCacheTime) {
            delete versionsCache[key];
        }
    }
}