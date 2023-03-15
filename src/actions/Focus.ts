import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { Action, ActionContext } from "./base/Action";

export class Focus implements Action {
    constructor(private readonly provider: SolutionExplorerProvider) {
    }

    public execute(context: ActionContext): Promise<void> {
        if (!context.cancelled) {
            this.provider.focus();
        }

        return Promise.resolve();
    }

    public toString(): string {
        return `Focus tree view`;
    }
}
