import * as path from "@extensions/path";
import { EventTypes, IEvent, ISubscription, IFileEvent } from "@events";
import { TreeItemContext } from "@tree";
import { ProjectInSolution } from "@core/Solutions";
import { ProjectTreeItem } from "@tree/items/ProjectTreeItem";

export class WebSiteProjectTreeItem extends ProjectTreeItem {
    private subscription: ISubscription | undefined;

    constructor(context: TreeItemContext, projectInSolution: ProjectInSolution) {
        super(context, projectInSolution);
        this.subscription = context.eventAggregator.subscribe(EventTypes.file, evt => this.onFileEvent(evt));
    }

    public dispose(): void {
        if (this.subscription) {
            this.subscription.dispose();
            this.subscription = undefined;
        }

        super.dispose();
    }

    private onFileEvent(event: IEvent): void {
        let fileEvent = <IFileEvent> event;
        if (this.path) {
            let workingdir = path.dirname(this.path);
            let dirname = path.dirname(fileEvent.path);

            if (dirname.startsWith(workingdir)) {
                this.refresh();
            }
        }
    }
}
