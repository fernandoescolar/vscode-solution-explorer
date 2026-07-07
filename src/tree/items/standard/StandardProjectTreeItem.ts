import { EventTypes, IEvent, ISubscription, IFileEvent, FileEvent } from "@events";
import { SolutionItem } from "@core/Solutions";
import { TreeItemContext } from "@tree";
import { ProjectTreeItem } from "@tree/items/ProjectTreeItem";

export class StandardProjectTreeItem extends ProjectTreeItem {
    private subscription: ISubscription | undefined;

    constructor(context: TreeItemContext, solutionItem: SolutionItem) {
        super(context, solutionItem);
        this.subscription = context.eventAggregator.subscribe(EventTypes.file, evt => this.onFileEvent(evt));
    }

    public dispose(): void {
        if (this.subscription) {
            this.subscription.dispose();
            this.subscription = undefined;
        }

        super.dispose();
    }

    protected shouldHandleFileEvent(fileEvent: FileEvent): boolean {
        return fileEvent.path === this.project?.fullPath;
    }

    private isBuildFile(filepath: string): boolean {
        const lower = filepath.toLocaleLowerCase();
        return lower.endsWith('.props') || lower.endsWith('.targets');
    }

    private async onFileEvent(event: IEvent): Promise<void> {
        let fileEvent = <IFileEvent> event;
        if (!this.project) { return; }

        let shouldRefresh = this.shouldHandleFileEvent(fileEvent);
        if (!shouldRefresh && this.isBuildFile(fileEvent.path)) {
            const externalFiles = await this.project.getExternalDependencyFiles();
            shouldRefresh = externalFiles.some(f => f.toLocaleLowerCase() === fileEvent.path.toLocaleLowerCase());
        }

        if (shouldRefresh) {
            await this.project.refresh();
            this.refresh();
        }
    }
}
