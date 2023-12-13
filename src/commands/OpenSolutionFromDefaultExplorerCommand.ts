import { IEventAggregator } from "@events";
import { Action, Focus, OpenSolution } from "@actions";
import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { SingleItemActionsFromDefaultExplorerCommand } from "./SingleItemActionsFromDefaultExplorerCommand";


export class OpenSolutionFromDefaultExplorerCommand extends SingleItemActionsFromDefaultExplorerCommand {
    constructor(private readonly eventAggregator: IEventAggregator, private readonly provider: SolutionExplorerProvider) {
        super('Open Solution');
    }

    public shouldRun(item: string): boolean {
        return item.toLocaleLowerCase().endsWith('.sln');
    }

    public async getActions(item: string): Promise<Action[]> {
        return [
            new OpenSolution(item, this.eventAggregator),
            new Focus(this.provider)
        ];
    }
}
