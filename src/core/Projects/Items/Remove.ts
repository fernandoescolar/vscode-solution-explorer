import * as path from "@extensions/path";
import * as glob from "@extensions/glob";
import { ProjectItem } from "./ProjectItem";
import { ProjectItemEntry } from "./ProjectItemEntry";

export class Remove extends ProjectItem {
    public readonly value: string;
    private readonly internalPath: string;

    constructor(type: string, value: string) {
        super(type);
        this.value = value;
        this.internalPath = this.getInternalPath();
    }

    public getEntries(projectBasePath: string, entries: ProjectItemEntry[]): Promise<ProjectItemEntry[]> {
        for (let index = 0; index < entries.length; index++) {
            const entry = entries[index];
            if (glob.globTest(this.value.split(";").map(s => path.join(projectBasePath, s)), entry.fullPath)) {
                entries.splice(index, 1);
                index--;
            }
        }

        return Promise.resolve(entries);
    }

    public isPathRemoved(projectBasePath: string, sourcePath: string): boolean {
        return glob.globTest(this.value.split(";").map(s => path.join(projectBasePath, s)), sourcePath);
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
}
