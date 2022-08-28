import { ContextValues, TreeItem } from "@tree";
import { Action, Publish } from "@actions";
import { ActionsCommand } from "@commands";
import {getText} from "@extensions/dialogs";

export class PublishCommand extends ActionsCommand {
    constructor() {
        super('Publish');
    }

    public  shouldRun(item: TreeItem): boolean {
        return item && (item.contextValue === ContextValues.project + '-cps' || item.contextValue === ContextValues.solution + '-cps');
    }

    public async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.path) { return []; }

        const outputPath = await getText('Output Path','Enter the output path or just click enter','') || '';

        return [ new Publish(item.path, outputPath) ];
    }
}
