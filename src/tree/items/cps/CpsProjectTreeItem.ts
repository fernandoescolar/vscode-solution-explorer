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

    private isBuildFile(filepath: string): boolean {
        const lower = filepath.toLocaleLowerCase();
        return lower.endsWith('.props') || lower.endsWith('.targets');
    }

    private async onFileEvent(event: IEvent): Promise<void> {
        let fileEvent = <IFileEvent> event;
        if (!this.path) { return; }

        let workingdir = path.dirname(this.path);
        let dirname = path.dirname(fileEvent.path);

        if (fileEvent.path === this.path && this.project) {
            this.refresh();
            return;
        }

        if (dirname.startsWith(workingdir)) {
            this.refresh();
            return;
        }

        // external Directory.Build.*/Directory.Packages.props or explicit <Import>
        // targets living outside this project's own directory
        if (this.project && this.isBuildFile(fileEvent.path)) {
            const externalFiles = await this.project.getExternalDependencyFiles();
            if (externalFiles.some(f => f.toLocaleLowerCase() === fileEvent.path.toLocaleLowerCase())) {
                this.refresh();
            }
        }
    }
}
