import * as path from "@extensions/path";
import { ProjectItem } from "./ProjectItem";
import { ProjectItemEntry } from "./ProjectItemEntry";

export class Folder extends ProjectItem {
    constructor(public readonly folderpath: string) {
        super("Folder");
    }

    public getEntries(projectBasePath: string, entries: ProjectItemEntry[]): Promise<ProjectItemEntry[]> {
        const folderpath = path.resolve(projectBasePath, this.folderpath);
        const name = path.basename(folderpath);
        entries.push({
            name: name,
            fullPath: folderpath,
            relativePath: this.folderpath,
            isDirectory: true,
            isLink: false,
            dependentUpon: undefined
        });

        return Promise.resolve(entries);
    }
}
