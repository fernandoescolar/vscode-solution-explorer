import * as path from "@extensions/path";
import * as config from "@extensions/config";
import { ProjectItemEntry, PackageReference, ProjectReference, Reference } from "./Items";
import { ProjectWithManagers } from "./ProjectWithManagers";

export class MsBuildProject extends ProjectWithManagers {
    private references: Reference[] = [];
    private projectReferences: ProjectReference[] = [];
    private packagesReferenges: PackageReference[] = [];
    private projectItemEntries: ProjectItemEntry[] = [];

    constructor(projectFullPath: string, withReferences?: boolean, includePrefix?: string) {
        super(projectFullPath, withReferences, includePrefix);
    }

    public async refresh(): Promise<void> {
        this.references = [];
        this.packagesReferenges = [];
        this.projectReferences = [];
        this.projectItemEntries = [];
        await super.refresh();
        await this.checkProjectLoaded();
    }

    public async getReferences(): Promise<Reference[]> {
        await this.checkProjectLoaded();
        return this.references;
    }

    public async getProjectReferences(): Promise<ProjectReference[]> {
        await this.checkProjectLoaded();
        return this.projectReferences;
    }

    public async getPackageReferences(): Promise<PackageReference[]> {
        await this.checkProjectLoaded();
        return this.packagesReferenges;
    }

    public async getProjectItemEntries(): Promise<ProjectItemEntry[]> {
        await this.checkProjectLoaded();
        return this.projectItemEntries;
    }

    public async getFolderList(): Promise<string[]> {
        await this.getProjectItemEntries();
        const result: string[] = [ '.' ];
        const ignore = config.getNetCoreIgnore();
        this.projectItemEntries.forEach(item => {
            const name = item.isDirectory ? item.relativePath : path.dirname(item.relativePath);
            if (result.indexOf(name) < 0 && ignore.indexOf(name.toLocaleLowerCase()) < 0) {
                result.push(name);
            }
        });

        result.sort((a, b) => {
            if (a === '.' + path.sep) {
                return -1;
            }

            if (b === '.' + path.sep) {
                return 1;
            }

            return a.localeCompare(b);
        });

        return result;
    }

    private async checkProjectLoaded(): Promise<void> {
        const projectItems = await this.xml.getProjectItems();
        if (this.references.length <= 0) {
            projectItems.forEach(item => {
                if (item.type === "Reference") {
                    this.references.push(item as Reference);
                }
            });
        }

        if (this.packagesReferenges.length <= 0) {
            projectItems.forEach(item => {
                if (item.type === "PackageReference") {
                    this.packagesReferenges.push(item as PackageReference);
                }
            });
        }

        if (this.projectReferences.length <= 0) {
            projectItems.forEach(item => {
                if (item.type === "ProjectReference") {
                    this.projectReferences.push(item as ProjectReference);
                }
            });
        }

        if (this.projectItemEntries.length <= 0) {
            this.projectItemEntries = await this.evaluateProjectItemEntries();
        }
    }

    private async evaluateProjectItemEntries(): Promise<ProjectItemEntry[]> {
        const projectItems = await this.xml.getProjectItems();
        const entries: ProjectItemEntry[] = [];
        const projectBasePath = path.dirname(this.fullPath);
        for(const item of projectItems) {
            await item.getEntries(projectBasePath, entries);
        }

        return entries;
    }
}
