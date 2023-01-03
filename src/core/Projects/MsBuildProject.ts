import * as fs from "@extensions/fs";
import * as path from "@extensions/path";
import * as config from "@extensions/config";
import { ProjectItemEntry, PackageReference, ProjectReference, Reference } from "./Items";
import { ProjectWithManagers } from "./ProjectWithManagers";

export class MsBuildProject extends ProjectWithManagers {
    private references: Reference[] = [];
    private projectReferences: ProjectReference[] = [];
    private packagesReferences: PackageReference[] = [];
    private projectItemEntries: ProjectItemEntry[] = [];

    constructor(projectFullPath: string, withReferences?: boolean, includePrefix?: string) {
        super(projectFullPath, withReferences, includePrefix);
    }

    public async preload(): Promise<void> {
        this.references = [];
        this.packagesReferences = [];
        this.projectReferences = [];
        this.projectItemEntries = [];
        await super.preload();
        await super.refresh();
    }

    public async refresh(): Promise<void> {
        this.references = [];
        this.packagesReferences = [];
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
        return this.packagesReferences;
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

    public async renameFolder(folderpath: string, oldname: string, newname: string): Promise<string> {
        const relativeFolder = path.relative(path.dirname(this.fullPath), folderpath);
        if (relativeFolder.startsWith('..' + path.sep)) { // link folder
            if (await this.xml.tryReplaceLinkFolderName(relativeFolder, oldname, newname)) {
                return newname;
            }
        }

        return await super.renameFolder(folderpath, oldname, newname);
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

        if (this.packagesReferences.length <= 0) {
            if (!this.xml.isCps) {
                this.packagesReferences = await this.parsePackagesConfig();
            } else {
                projectItems.forEach(item => {
                    if (item.type === "PackageReference") {
                        this.packagesReferences.push(item as PackageReference);
                    }
                });
            }
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

    private async parsePackagesConfig(): Promise<PackageReference[]> {
        const result: PackageReference[] = [];
        let packagesPath = path.join(path.dirname(this.fullPath), 'packages.config');
        if (!(await fs.exists(packagesPath))) { return []; }

        let content = await fs.readFile(packagesPath);
        let packageRegEx = /<package\s+id=\"(.*)\"\s+version=\"(.*)\"\s+targetFramework=\"(.*)\"/g;
        let m: RegExpExecArray | null;
        while ((m = packageRegEx.exec(content)) !== null) {
            result.push(new PackageReference(m[1].trim(), m[2].trim()));
        }

        return result;
    }
}
