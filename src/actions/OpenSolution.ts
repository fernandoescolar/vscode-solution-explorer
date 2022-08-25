import { IEventAggregator, SolutionSelected } from "@events";
import { Action, ActionContext } from "./base/Action";

export class OpenSolution implements Action {
    constructor(private readonly solutionPath: string, public readonly eventAggregator: IEventAggregator) {
    }

    public execute(context: ActionContext): Promise<void> {
        if (context.cancelled) { return Promise.resolve(); }
        if (!this.solutionPath) { return Promise.resolve(); }

        const e = new SolutionSelected(this.solutionPath);
        this.eventAggregator.publish(e);

        return Promise.resolve();
    }

    public toString(): string {
        return `Open solution: ${this.solutionPath}`;
    }

}
