import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import * as glob from "@extensions/glob";
import { ProjectItemEntry } from "./ProjectItemEntry";
import { IncludeBase } from "./IncludeBase";

export class Include extends IncludeBase {
    private readonly internalPath: string;

    constructor(type: string, value: string, link?: string, linkBase?: string, public readonly exclude?: string, public readonly dependentUpon?: string) {
        super(type, value, link, linkBase);
        this.internalPath = this.getInternalPath();
    }

    public async getEntries(projectBasePath: string, entries: ProjectItemEntry[]): Promise<ProjectItemEntry[]> {
        const searchPath = path.join(projectBasePath, this.internalPath);
        for (const pattern of this.value.split(';')) {
            const result = await glob.globFileSearch(searchPath, this.cleanPathDownAtStart(pattern), this.exclude ? this.exclude?.split(';') : undefined);
            for (const filepath of result) {
                const recursiveDir = this.getRecursiveDir(filepath, searchPath);
                const relativePath = this.getRelativePath(filepath, recursiveDir);
                const isLink = !filepath.startsWith(projectBasePath);
                const folderEntries: ProjectItemEntry[] = this.createFoldersIfNotExists(entries, relativePath, filepath, isLink);
                if (folderEntries.length > 0) {
                    entries.push(...folderEntries);
                }
                const filename = path.basename(relativePath);
                const isDirectory = await fs.isDirectory(filepath);
                entries.push({
                    name: filename,
                    fullPath: filepath,
                    relativePath: relativePath,
                    isDirectory: isDirectory,
                    isLink: isLink,
                    dependentUpon: this.dependentUpon
                });
            }
        }

        return entries;
    }

    private createFoldersIfNotExists( entries: ProjectItemEntry[], relativePath: string, filepath: string, isLink: boolean): ProjectItemEntry[] {
        const folderEntries: ProjectItemEntry[] = [];
        let relativeFolder = path.dirname(relativePath);
        while (relativeFolder && relativeFolder !== ".") {
            const folder = entries.find(e => e.relativePath === relativeFolder);
            if (!folder) {
                folderEntries.push({
                    name: path.basename(relativeFolder),
                    fullPath: path.dirname(filepath),
                    relativePath: relativeFolder,
                    isDirectory: true,
                    isLink: isLink,
                    dependentUpon: undefined
                });
            }

            relativeFolder = path.dirname(relativeFolder);
        }

        return folderEntries.reverse();
    }

    public isPathIncluded(projectBasePath: string, sourcePath: string): boolean {
        return this.testIncluded(projectBasePath, sourcePath) && !this.testExcluded(projectBasePath, sourcePath);
    }

    private testIncluded(projectBasePath: string, text: string): boolean {
        return glob.globTest(this.value.split(';').map(s => path.join(projectBasePath, s)), text);
    }

    private testExcluded(projectBasePath: string, text: string): boolean {
        return glob.globTest((this.exclude ? this.exclude.split(';') : []).map(s => path.join(projectBasePath, s)), text);
    }

    private getRecursiveDir(filepath: string, searchPath: string): string {
        let result = path.dirname(filepath).substring(searchPath.length + 1);
        if (result) {
            if (result.startsWith(path.sep)) {
                result = result.substring(1);
            }
            if (!result.endsWith(path.sep)) {
                result += path.sep;
            }
        }

        return result;
    }

    private getInternalPath(): string {
        const search = (c: string) => {
            const index = this.value.indexOf('*');
            if (index < 0) {
                return this.value.length;
            }

            return index;
        }
        const index = Math.min(
                        search('*'),
                        search('?'),
                        search('['),
                        search('{'));

        return path.dirname(this.value.substring(0, index + 1));
    }

    private cleanPathDownAtStart(filepath: string): string {
        const folderDown = ".." + path.sep;
        while(filepath.startsWith(folderDown)) {
            filepath = filepath.substring(folderDown.length);
        }

        return filepath;
    }

}
