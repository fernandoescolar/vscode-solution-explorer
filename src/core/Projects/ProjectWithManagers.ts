import { ProjectFileStat } from "./ProjectFileStat";
import { ProjectWithNugetDependencies } from "./ProjectWithNugetDependencies";
import { Manager, XmlManager, FileManager } from "./Managers";
import { RelativeFilePosition } from "./RelativeFilePosition";

export abstract class ProjectWithManagers extends ProjectWithNugetDependencies {
    protected readonly xml: XmlManager;
    protected readonly files: FileManager;

    constructor(projectFullPath: string, withReferences?: boolean, includePrefix?: string) {
        super(projectFullPath, withReferences);
        this.xml = new XmlManager(projectFullPath, includePrefix);
        this.files = new FileManager(projectFullPath);
    }

    public get type(): string {
        return this.xml.isCps ? "cps" : "standard";
    }

    private get managers(): Manager[] {
        return [this.files, this.xml];
    }

    public async refresh(): Promise<void> {
        await super.refresh();
        await this.xml.refresh();
    }

    public createFile(folderpath: string, filename: string, content?: string | undefined, relativePosition?:RelativeFilePosition): Promise<string> {
        return this.callInManagers(m => m.createFile(folderpath, filename, content, relativePosition));
    }

    public createFolder(folderpath: string): Promise<string> {
        return this.callInManagers(m => m.createFolder(folderpath));
    }

    public deleteFile(filepath: string): Promise<void> {
        return this.callInManagers(m => m.deleteFile(filepath));
    }

    public deleteFolder(folderpath: string): Promise<void> {
        return this.callInManagers(m => m.deleteFolder(folderpath));
    }

    public moveFile(filepath: string, newfolderPath: string): Promise<string> {
        return this.callInManagers(m => m.moveFile(filepath, newfolderPath));
    }

    public moveFileUp(filepath: string): Promise<string> {
        return this.callInManagers(m => m.moveFileUp(filepath));
    }

    public moveFileDown(filepath: string): Promise<string> {
        return this.callInManagers(m => m.moveFileDown(filepath));
    }

    public moveFolder(folderpath: string, newfolderPath: string): Promise<string> {
        return this.callInManagers(m => m.moveFolder(folderpath, newfolderPath));
    }

    public renameFile(filepath: string, name: string): Promise<string> {
        return this.callInManagers(m => m.renameFile(filepath, name));
    }

    public renameFolder(folderpath: string, oldname: string, newname: string): Promise<string> {
        return this.callInManagers(m => m.renameFolder(folderpath, newname));
    }

    public statFile(filepath: string, folderPath: string): Promise<ProjectFileStat> {
        return this.files.statFile(filepath, folderPath);
    }

    private callInManagers<T>(callback: (manager: Manager) => Promise<T>): Promise<T> {
        const promises: Promise<T>[] = [];
        this.managers.forEach(manager => {
            promises.push(callback(manager));
        });

        return Promise.all(promises).then(results => {
            return results[0];
        });
    }
}
