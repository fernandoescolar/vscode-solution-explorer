import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { IEventAggegator } from "../events";
import { TreeItem } from "./";
import { SolutionFile } from "../model/Solutions";
import { Project } from "../model/Projects";
    
export class TreeItemContext {
    constructor(public readonly provider: SolutionExplorerProvider, public readonly solution: SolutionFile, public readonly project?: Project, public readonly parent?: TreeItem) {
    }

    public get eventAggregator(): IEventAggegator {
        return this.provider.eventAggregator;
    }

    public copy(project?: Project, parent?: TreeItem): TreeItemContext {
        return new TreeItemContext(this.provider, this.solution, project ? project : this.project, parent ? parent : this.parent);
    }
}