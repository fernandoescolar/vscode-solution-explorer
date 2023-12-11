
import * as dialogs from "@extensions/dialogs";
import { TreeItem } from "@tree";
import { IEventAggregator } from "@events";
import { Action, OpenSolution } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class OpenSolutionCommand extends SingleItemActionsCommand {
    constructor(private readonly eventAggregator: IEventAggregator) {
        super('Open Solution');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return true;
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
        const solutionPath = await dialogs.openSolutionFile('Open solution');
        if (!solutionPath) { return []; }

        return [new OpenSolution(solutionPath, this.eventAggregator)];
    }
}


