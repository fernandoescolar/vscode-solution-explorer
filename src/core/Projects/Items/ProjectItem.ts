import { ProjectItemEntry } from "./ProjectItemEntry";

export abstract class ProjectItem {
    constructor(public readonly type: string) {
    }

    public getEntries(projectBasePath: string, entries: ProjectItemEntry[]): Promise<ProjectItemEntry[]> {
        return Promise.resolve(entries);
    }

    public isPathIncluded(projectBasePath: string, sourcePath: string): boolean {
        return false;
    }

    public isPathRemoved(projectBasePath: string, sourcePath: string): boolean {
        return false;
    }
}
