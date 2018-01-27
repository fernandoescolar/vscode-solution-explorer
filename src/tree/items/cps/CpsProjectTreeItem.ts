import * as path from "path";
import { ProjectTreeItem } from "../ProjectTreeItem";
import { TreeItemContext } from "../../TreeItemContext";
import { Project } from "../../../model/Projects";
import { ProjectInSolution } from "../../../model/Solutions";
import { EventTypes, IEvent, ISubscription, IFileEvent } from "../../../events/index";
import { TreeItem } from "../../TreeItem";

export class CpsProjectTreeItem extends ProjectTreeItem {
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

    private onFileEvent(event: IEvent): void {
        let fileEvent = <IFileEvent> event;
        let workingdir = path.dirname(this.path);
        let dirname = path.dirname(fileEvent.path);

        if (fileEvent.path == this.path) {
            this.project.refresh().then(res => {
                this.refresh();
            });
        }
        else if (dirname.startsWith(workingdir)) {
            this.refresh();
        }
    }
}
