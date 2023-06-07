import * as path from "@extensions/path";
import { TreeItem, TreeItemCollapsibleState, TreeItemContext, ContextValues, TreeItemFactory } from "@tree";
import { ProjectItemEntry } from "@core/Projects";
import { EventTypes, IEvent, IFileEvent, ISubscription } from "@events";

export class ProjectFolderTreeItem extends TreeItem {
    private subscription: ISubscription | undefined;

    constructor(context: TreeItemContext, private readonly projectFolder: ProjectItemEntry) {
        super(context, projectFolder.name, TreeItemCollapsibleState.Collapsed, ContextValues.projectFolder, projectFolder.fullPath);
        if (projectFolder.isLink) {
            this.description = "link";
            this.subscription = context.eventAggregator.subscribe(EventTypes.file, evt => this.onFileEvent(evt));
        }
        this.addContextValueSuffix();
    }

    public dispose(): void {
        if (this.subscription) {
            this.subscription.dispose();
            this.subscription = undefined;
        }

        super.dispose();
    }

    protected async createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {
        if (!this.project) {
            return [];
        }

        let virtualPath = this.projectFolder.relativePath;
        if (virtualPath.startsWith(path.sep)) {
            virtualPath = virtualPath.substring(1);
        }

        let result: TreeItem[] = [];
        let items = await TreeItemFactory.createItemsFromProject(childContext, this.project, virtualPath);
        items.forEach(item => result.push(item));

        return result;
    }

    private onFileEvent(event: IEvent): void {
        let fileEvent = <IFileEvent> event;
        if (this.path) {
            const workingdir = this.path;
            const dirname = path.dirname(fileEvent.path);
            if (dirname.startsWith(workingdir) && this.project) {
                this.project.refresh().then(() => this.refresh());
            }
        }
    }

    protected addContextValueSuffix(): void {
        if (this.project?.extension.toLocaleLowerCase() === 'fsproj') {
		    this.contextValue += '-fs';
        }
	}
}
