
import * as dialogs from "@extensions/dialogs";
import { TreeItem } from "@tree";
import { IEventAggregator, SolutionSelected } from "@events";
import { ICommand } from "@commands/base";

export class OpenSolutionCommand implements ICommand {
    constructor(public readonly eventAggregator: IEventAggregator) {
    }

    public async run(item: TreeItem): Promise<void> {
        const solutionPath = await dialogs.openSolutionFile('Open solution');
        if (!solutionPath) { return; }

        const e = new SolutionSelected(solutionPath);
        this.eventAggregator.publish(e);
    }
}
