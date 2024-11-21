import { TreeItem} from "@tree";
import { Action } from "@actions";
import { SingleItemActionsCommand } from "@commands";
import { InvalidateNugetCache } from "@actions";


export class InvalidateNugetCacheCommand extends SingleItemActionsCommand {
    constructor() {
        super('Invalidate Nuget Cache');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return true;
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
        return [new InvalidateNugetCache()];
    }
}
