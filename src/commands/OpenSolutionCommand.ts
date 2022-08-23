
import { TreeItem } from "@tree";
import { IEventAggregator, SolutionSelected } from "@events";
import { CommandBase } from "@commands/base";
import { OpenFileCommandParameter } from "@commands/parameters/OpenFileCommandParameter";

export class OpenSolutionCommand extends CommandBase {
    constructor(public readonly eventAggregator: IEventAggregator) {
        super('Open solution');
    }

    protected shouldRun(item: TreeItem): boolean {
        let options = {
		    openLabel: 'Open solution',
    		canSelectFolders: false,
    		canSelectMany: false,
		    filters: { ['Solution files']: [ 'sln' ] }
        };
        this.parameters = [
            new OpenFileCommandParameter(options)
        ];

        return true;
    }

    protected runCommand(item: TreeItem, args: string[]): Promise<void> {
        const e = new SolutionSelected(args[0]);
        this.eventAggregator.publish(e);

        return Promise.resolve();
    }
}
