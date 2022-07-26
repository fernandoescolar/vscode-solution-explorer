
import { OpenDialogOptions } from "vscode";
import { CommandBase } from "./base/CommandBase";
import { TreeItem } from "../tree/TreeItem";
import { OpenFileCommandParameter } from "./parameters/OpenFileCommandParameter";
import { IEventAggregator, SolutionSelected } from "../events";

export class OpenSolutionCommand extends CommandBase {
    constructor(public readonly eventAggregator: IEventAggregator) {
        super('Open solution');
    }

    protected shouldRun(item: TreeItem): boolean {
        let options: OpenDialogOptions = {
		    openLabel: 'Open solution',
    		canSelectFolders: false,
    		canSelectMany: false,
		    filters: { 'Solution files': [ 'sln' ] }
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