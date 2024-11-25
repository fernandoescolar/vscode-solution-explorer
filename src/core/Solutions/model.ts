import * as path from '@extensions/path';

export interface SolutionItem {
    parent: SolutionParentObject | undefined;
    name: string;
    fullPath: string | undefined;
    id: string;
    getFullDisplayName(): string;
}

class SolutionObject {
    public parent: SolutionParentObject | undefined;
    public name: string = '';
    public fullPath: string | undefined;
    public getFullDisplayName(): string {
        return this.name;
    }
}

export class SolutionParentObject extends SolutionObject {
    protected items: SolutionItem[] = [];

    public addItem(item: SolutionItem): void {
        this.items.push(item);
    }

    public getFolders(): SolutionFolder[] {
        return this.items.filter((item) => item instanceof SolutionFolder) as SolutionFolder[];
    }

    public getProjects(): SolutionProject[] {
        return this.items.filter((item) => item instanceof SolutionProject) as SolutionProject[];
    }

    public getAllFolders(): SolutionFolder[] {
        let result: SolutionFolder[] = [];
        this.getFolders().forEach(folder => {
            result.push(folder);
            result = result.concat(folder.getAllFolders());
        });

        return result;
    }

    public getAllProjects(): SolutionProject[] {
        let result: SolutionProject[] = [];
        this.getProjects().forEach(project => result.push(project));
        this.getFolders().forEach(folder => result = result.concat(folder.getAllProjects()));

        return result;
    }
}

export enum SolutionType {
    Sln,
    Slnx
}

export class Solution extends SolutionParentObject {
    public folderPath: string = "";
    public fullPath: string = "";
    public type: SolutionType = SolutionType.Sln;
}

export class SolutionFolder extends SolutionParentObject implements SolutionItem {
    constructor(public id: string) {
        super();
    }

    public solutionFiles: { [id: string] : string } = {};

    public getFullDisplayName(): string {
        if (!this.parent) { return this.name; }
        return this.parent.getFullDisplayName() + path.sep + this.name;
    }
}

export enum SolutionProjectType {
    unknown,
    default,
    shared,
    noReferences
}

export class SolutionProject extends SolutionObject implements SolutionItem {
    constructor(public id: string) {
        super();
    }

    public type: SolutionProjectType = SolutionProjectType.unknown;

    public getFullDisplayName(): string {
        if (!this.parent) { return this.name; }
        return this.parent.getFullDisplayName() + path.sep + this.name;
    }
}

