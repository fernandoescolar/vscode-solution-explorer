import { PackageReference } from "@core/Projects";
import { LocalTool, LocalTools } from "@core/Utilities/LocalTools";
import { EventTypes, IEvent, IFileEvent, ISubscription } from "@events";
import { TreeItem, TreeItemCollapsibleState, TreeItemContext, ContextValues } from "@tree";
import { LocalToolTreeItem } from "./LocalToolTreeItem";

export class LocalToolsTreeItem extends TreeItem {
    private subscription: ISubscription | undefined;

    constructor(context: TreeItemContext, private localTools: LocalTool[]) {
        super(
            context,
            'Local Tools',
            localTools.length > 0 ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None,
            ContextValues.localTools
        );
        this.allowIconTheme = false;
        this.subscription = context.eventAggregator.subscribe(EventTypes.file, evt => this.onFileEvent(evt));
    }

    public dispose(): void {
        if (this.subscription) {
            this.subscription.dispose();
            this.subscription = undefined;
        }
        super.dispose();
    }

    public getLocalTools(): LocalTool[] {
        return this.localTools;
    }

    protected async createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {
        return this.localTools.map((localTool) => new LocalToolTreeItem(
            childContext,
            new PackageReference(localTool.name, localTool.version)
        ));
    }

    private onFileEvent(event: IEvent): void {
        const fileEvent = <IFileEvent> event;
        if (fileEvent.path.endsWith('dotnet-tools.json')) {
            this.localTools = LocalTools.getInstalledLocalTools(this.context.workspaceRoot);
            this.collapsibleState = this.localTools.length > 0 ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None;
            this.refresh();
        }
    }
}
