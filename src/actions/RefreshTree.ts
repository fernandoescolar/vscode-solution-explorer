import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { Action, ActionContext } from "./base/Action";

export class RefreshTree implements Action {
    constructor(private readonly provider: SolutionExplorerProvider) {
    }

    public execute(context: ActionContext): Promise<void> {
        if (!context.cancelled) {
            this.provider.refresh();
        }

        return Promise.resolve();
    }

    public toString(): string {
        return `Refresh Tree`;
    }
}
