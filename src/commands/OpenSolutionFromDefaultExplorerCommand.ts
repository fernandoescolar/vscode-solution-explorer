import { IEventAggregator } from "@events";
import { Action, OpenSolution } from "@actions";
import { SingleItemActionsFromDefaultExplorerCommand } from "./SingleItemActionsFromDefaultExplorerCommand";


export class OpenSolutionFromDefaultExplorerCommand extends SingleItemActionsFromDefaultExplorerCommand {
    constructor(private readonly eventAggregator: IEventAggregator) {
        super('Open Solution');
    }

    public shouldRun(item: string): boolean {
        return item.toLocaleLowerCase().endsWith('.sln');
    }

    public async getActions(item: string): Promise<Action[]> {
        return [new OpenSolution(item, this.eventAggregator)];
    }
}
