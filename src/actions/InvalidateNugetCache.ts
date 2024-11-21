import { Action, ActionContext } from "./base/Action";
import * as nuget from '@extensions/nuget';

export class InvalidateNugetCache implements Action {
    constructor() {
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) { return; }

        nuget.invalidateCache();
    }

    public toString(): string {
        return `Invalidate Nuget cache`;
    }
}
