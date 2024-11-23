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

    private onFileEvent(event: IEvent): void {
        let fileEvent = <IFileEvent> event;
        if (this.shouldHandleFileEvent(fileEvent) && this.project) {
            this.project.refresh().then(res => {
                this.refresh();
            });
        }
    }
}
