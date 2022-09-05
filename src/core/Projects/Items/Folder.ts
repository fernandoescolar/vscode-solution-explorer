import * as path from "@extensions/path";
import { ProjectItem } from "./ProjectItem";
import { ProjectItemEntry } from "./ProjectItemEntry";

export class Folder extends ProjectItem {
    constructor(public readonly folderpath: string) {
        super("Folder");
    }

    public getEntries(projectBasePath: string, entries: ProjectItemEntry[]): Promise<ProjectItemEntry[]> {
        const folderpath = path.resolve(projectBasePath, this.folderpath);
        entries.push(...this.createFoldersIfNotExists(entries, this.folderpath, path.dirname(this.folderpath), false));

        const name = path.basename(folderpath);
        const exists = entries.find(e => e.relativePath === this.folderpath);
        if (!exists) {
            entries.push({
                name: name,
                fullPath: folderpath,
                relativePath: this.folderpath,
                isDirectory: true,
                isLink: false,
                dependentUpon: undefined
            });
        }
        return Promise.resolve(entries);
    }

    private createFoldersIfNotExists( entries: ProjectItemEntry[], relativePath: string, filepath: string, isLink: boolean): ProjectItemEntry[] {
        const folderEntries: ProjectItemEntry[] = [];
        let relativeFolder = path.dirname(relativePath);
        filepath = path.dirname(filepath);
        while (relativeFolder && relativeFolder !== ".") {
            const folder = entries.find(e => e.relativePath === relativeFolder);
            if (!folder) {
                folderEntries.push({
                    name: path.basename(relativeFolder),
                    fullPath: filepath,
                    relativePath: relativeFolder,
                    isDirectory: true,
                    isLink: isLink,
                    dependentUpon: undefined
                });
            }

            relativeFolder = path.dirname(relativeFolder);
            filepath = path.dirname(filepath);
        }

        return folderEntries.reverse();
    }
}
