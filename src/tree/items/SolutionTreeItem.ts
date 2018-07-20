import { TreeItem, TreeItemCollapsibleState } from "../TreeItem";
import { TreeItemContext } from "../TreeItemContext";
import { ContextValues } from "../ContextValues";
import { SolutionFile } from "../../model/Solutions";
import * as TreeItemFactory from "../TreeItemFactory";
import { ISubscription, EventTypes, IEvent, IFileEvent, FileEventType } from "../../events";

export class SolutionTreeItem extends TreeItem {
    private subscription: ISubscription = null;
     
    constructor(context: TreeItemContext) {
        super(context, context.solution.Name, TreeItemCollapsibleState.Expanded, ContextValues.Solution, context.solution.FullPath);
        this.allowIconTheme = false;
        this.subscription = context.eventAggregator.subscribe(EventTypes.File, evt => this.onFileEvent(evt))
    }
    
    public refreshContextValue(): void {
        if (this.containsContextValueChildren(ContextValues.Project + '-cps')) {
            this.contextValue = ContextValues.Solution + '-cps';
        } else {
            this.contextValue = ContextValues.Solution;
        }
    }

    public dispose(): void {
        this.subscription.dispose();
        this.subscription = null;
        super.dispose();
    }

    protected createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {  
        return TreeItemFactory.CreateItemsFromSolution(childContext, this.solution);
    }

    private onFileEvent(event: IEvent): void {
        let fileEvent = <IFileEvent> event;
        if (fileEvent.path == this.solution.FullPath && fileEvent.fileEventType != FileEventType.Delete) {
            SolutionFile.Parse(this.solution.FullPath).then(res => {
                this.context = new TreeItemContext(this.context.provider, res);
                this.refresh();
            });
        }
    }
}