import * as path from "@extensions/path";
import { TreeItemContext } from "@tree";
import { SolutionItem } from "@core/Solutions";
import { EventTypes, IEvent, ISubscription, IFileEvent } from "@events";
import { ProjectTreeItem } from "@tree/items/ProjectTreeItem";

export class CpsProjectTreeItem extends ProjectTreeItem {
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

    private onFileEvent(event: IEvent): void {
        let fileEvent = <IFileEvent> event;
        if (this.path) {
            let workingdir = path.dirname(this.path);
            let dirname = path.dirname(fileEvent.path);

            if (fileEvent.path === this.path && this.project) {
                this.refresh();
            }
            else if (dirname.startsWith(workingdir)) {
                this.refresh();
            }
        }
    }
}
