import * as path from "path";
import { ProjectTreeItem } from "../ProjectTreeItem";
import { TreeItemContext } from "../../TreeItemContext";
import { Project } from "../../../model/Projects";
import { ProjectInSolution } from "../../../model/Solutions";
import { EventTypes, IEvent, ISubscription, IFileEvent, FileEvent } from "../../../events/index";

export class StandardProjectTreeItem extends ProjectTreeItem {
    private subscription: ISubscription = null;

    constructor(context: TreeItemContext, projectInSolution: ProjectInSolution) {
        super(context, projectInSolution);
        this.subscription = context.eventAggregator.subscribe(EventTypes.File, evt => this.onFileEvent(evt))
    }

    public dispose(): void {
        this.subscription.dispose();
        this.subscription = null;
        super.dispose();
    }

    protected shouldHandleFileEvent(fileEvent: FileEvent): boolean {
        return fileEvent.path == this.path;
    }

    private onFileEvent(event: IEvent): void {
        let fileEvent = <IFileEvent> event;
        if (this.shouldHandleFileEvent(fileEvent)) {
            this.project.refresh().then(res => {
                this.refresh();
            });
        }
    }
}
