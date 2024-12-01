import { ISubscription, EventTypes, IEvent, IFileEvent, FileEventType } from "@events";
import { Solution, SolutionFactory, SolutionType } from "@core/Solutions";
import { TreeItem, TreeItemCollapsibleState, TreeItemFactory, TreeItemContext, ContextValues } from "@tree";
import { DirectoryPackages } from "@core/DirectoryPackages";

export class SolutionTreeItem extends TreeItem {
    private subscription: ISubscription | undefined;

    constructor(context: TreeItemContext) {
        super(context, context.solution.name, TreeItemCollapsibleState.Expanded, ContextValues.solution, context.solution.fullPath);
        this.allowIconTheme = false;
        this.subscription = context.eventAggregator.subscribe(EventTypes.file, evt => this.onFileEvent(evt));
        this.description = context.solution.type === SolutionType.Sln ? '' : 'readonly';
    }

    public refreshContextValue(): void {
        if (this.containsContextValueChildren(ContextValues.project + '-cps')) {
            this.contextValue = ContextValues.solution + '-cps';
        } else {
            this.contextValue = ContextValues.solution;
        }
    }

    public dispose(): void {
        if (this.subscription) {
            this.subscription.dispose();
            this.subscription = undefined;
        }
        super.dispose();
    }

    protected createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {
        return TreeItemFactory.createItemsFromSolution(childContext, this.solution);
    }

    private onFileEvent(event: IEvent): void {
        let fileEvent = <IFileEvent>event;
        if (fileEvent.path === this.solution.fullPath && fileEvent.fileEventType !== FileEventType.delete) {
            SolutionFactory.load(this.solution.fullPath).then(res => {
                this.context = new TreeItemContext(this.context.provider, res, this.workspaceRoot);
                this.refresh();

                DirectoryPackages.existsInPath(this.solution.folderPath).then(exists => {
                    if (exists && !DirectoryPackages.isRunning()) {
                        const directoryPackages = new DirectoryPackages(this.solution.folderPath);
                        directoryPackages.load();
                        directoryPackages.addProjects(this.solution.getAllProjects());
                    }
                })
            });
        }
    }
}
