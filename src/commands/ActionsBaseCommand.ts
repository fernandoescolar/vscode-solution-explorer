import { TreeItem } from "@tree";
import { Action } from "@actions";

export abstract class ActionsBaseCommand {
    constructor(protected title: string) {
    }

    public abstract getActionsBase(clickedItem: TreeItem | undefined, selectedItems: readonly TreeItem[] | undefined):
        Promise<Action[]>;
}

type ContextActionGettersOptions =
    [context: string, action: (item: TreeItem) => Action[]] |
    [context: string, type: 'standard' | 'cps', action: (item: TreeItem) => Action[]];
    
type ContextActionGetters = { [allowedContext: string]: (item: TreeItem) => Action[] };

export function prepareContextActionGetters(options: ContextActionGettersOptions[]): ContextActionGetters {

    return Object.assign({}, ...options.flatMap(function (option) {
    
        const [context, type, actionsGetter] = option.length == 3 ? option : [option[0], undefined, option[1]];

        const allowedContexts = type ? [context + '-' + type] : [context, context + '-standard', context + '-cps'];

        return allowedContexts.map(allowedContext => ({ [allowedContext]: actionsGetter }));
    }));
}