
import * as dialogs from "@extensions/dialogs";
import { TreeItem } from "@tree";
import { IEventAggregator } from "@events";
import { Action, OpenSolution } from "@actions";
import { ActionsCommand } from "@commands";

export class OpenSolutionCommand extends ActionsCommand {
    constructor(private readonly eventAggregator: IEventAggregator) {
        super('Open Solution');
    }

    public  shouldRun(item: TreeItem): boolean {
        return true;
    }

    public async getActions(item: TreeItem): Promise<Action[]> {
        const solutionPath = await dialogs.openSolutionFile('Open solution');
        if (!solutionPath) { return []; }

        return [new OpenSolution(solutionPath, this.eventAggregator)];
    }
}
