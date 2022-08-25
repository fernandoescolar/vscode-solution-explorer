import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { Action, ActionContext } from "./base/Action";

export class CollapseAll implements Action {
    constructor(private readonly provider: SolutionExplorerProvider) {
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) {
            return;
        }

        let items = await this.provider.getChildren();
        if (items && items.length > 0) {
            items.forEach(i => i.collapse());
        }
    }

    public toString(): string {
        return "Collapse all";
    }
}