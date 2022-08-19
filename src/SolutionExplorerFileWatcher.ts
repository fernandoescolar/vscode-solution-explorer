import { workspace, FileSystemWatcher, Uri } from "vscode";
import { IFileEvent, FileEvent, FileEventType, IEventAggregator } from "@events";

export class SolutionExplorerFileWatcher {
    private fileWatcher: FileSystemWatcher | undefined;

    constructor(public readonly eventAggregator: IEventAggregator){
    }

    public register(): void {
        this.fileWatcher = workspace.createFileSystemWatcher("**/*");
	    this.fileWatcher.onDidChange(uri => this.onChange(uri));
	    this.fileWatcher.onDidCreate(uri => this.onCreate(uri));
        this.fileWatcher.onDidDelete(uri => this.onDelete(uri));
    }

    public unregister(): void {
        if (this.fileWatcher) {
            this.fileWatcher.dispose();
            this.fileWatcher = undefined;
        }
    }

    private onChange(uri: Uri): void {
        let event: IFileEvent = new FileEvent(FileEventType.modify, this.parseUri(uri));
        this.raiseEvent(event);
    }

    private onCreate(uri: Uri): void {
        let event: IFileEvent = new FileEvent(FileEventType.create, this.parseUri(uri));
        this.raiseEvent(event);
    }

    private onDelete(uri: Uri): void {
        let event: IFileEvent = new FileEvent(FileEventType.delete, this.parseUri(uri));
        this.raiseEvent(event);
    }

    private raiseEvent(event: IFileEvent): void {
        this.eventAggregator.publish(event);
    }

    private parseUri(uri: Uri): string {
        return uri.fsPath;
    }
}
