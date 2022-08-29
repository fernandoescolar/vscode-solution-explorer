import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { Action, ActionContext } from "./base/Action";

export class SelectActiveDocumentInTree implements Action {
    constructor(private readonly provider: SolutionExplorerProvider) {
    }

    public execute(context: ActionContext): Promise<void> {
        if (!context.cancelled) {
            this.provider.selectActiveDocument();
        }

        return Promise.resolve();
    }

    public toString(): string {
        return `Select active document in tree`;
    }
}
