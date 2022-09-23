import * as path from "@extensions/path";
import * as glob from "@extensions/glob";
import { ProjectItemEntry } from "./ProjectItemEntry";
import { IncludeBase } from "./IncludeBase";

export class Update extends IncludeBase {
    constructor(type: string, value: string, link?: string, linkBase?: string) {
        super(type, value, link, linkBase);
    }

    public getEntries(projectBasePath: string, entries: ProjectItemEntry[]): Promise<ProjectItemEntry[]> {
        for (let index = 0; index < entries.length; index++) {
            const entry = entries[index];
            if (glob.globTest(this.value.split(";").map(s => path.join(projectBasePath, s)), entry.fullPath)) {
                const recursiveDir = this.getRecursiveDir(path.sep + entry.relativePath, "");
                const relativePath = this.getRelativePath(entry.fullPath, recursiveDir);
                const filename = path.basename(relativePath);
                entry.name = filename;
                entry.relativePath = relativePath;
            }
        }

        return Promise.resolve(entries);
    }
}
