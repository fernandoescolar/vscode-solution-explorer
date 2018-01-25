import * as path from "path";
import { TreeItem, TreeItemCollapsibleState } from "../TreeItem";
import { TreeItemContext } from "../TreeItemContext";
import { ContextValues } from "../ContextValues";
import { SolutionFile } from "../../model/Solutions";
import * as TreeItemFactory from "../TreeItemFactory";
import { ISubscription, EventTypes, IEvent, IFileEvent } from "../../events";

export class SolutionTreeItem extends TreeItem {
    private subscription: ISubscription = null;
     
    constructor(context: TreeItemContext, private solution: SolutionFile) {
        super(context, solution.Name, TreeItemCollapsibleState.Expanded, ContextValues.Solution);
        this.subscription = context.eventAggregator.subscribe(EventTypes.File, evt => this.onFileEvent(evt))
    }
    
    public dispose(): void {
        this.subscription.dispose();
        this.subscription = null;
        super.dispose();
    }

    protected async createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {  
        let result: TreeItem[] = [];
        for (let i = 0; i < this.solution.Projects.length; i++){
            let p = this.solution.Projects[i];
            if (!p.parentProjectGuid) {
                let item = await TreeItemFactory.CreateFromProject(childContext, p);
                result.push(item);
            }
        }

        return result;
    }

    private onFileEvent(event: IEvent): void {
        let fileEvent = <IFileEvent> event;
        if (fileEvent.path == this.solution.FullPath) {
            SolutionFile.Parse(this.solution.FullPath).then(res => {
                this.solution = res;
                this.refresh();
            });
        }
    }
}