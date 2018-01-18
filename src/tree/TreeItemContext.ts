import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { IEventAggegator } from "../events";
import { TreeItem } from "./";
    
export class TreeItemContext {
    constructor(public readonly provider: SolutionExplorerProvider, public readonly parent?: TreeItem) {
    }

    public get eventAggregator(): IEventAggegator {
        return this.provider.eventAggregator;
    }

    public copy(parent?: TreeItem): TreeItemContext {
        return new TreeItemContext(this.provider, parent);
    }
}