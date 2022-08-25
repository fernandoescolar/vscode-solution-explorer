import { ILogger } from "@logs";
import { Action, ActionContext } from "@actions";

export class ActionsRunner {
    constructor(private readonly logger: ILogger) {
    }

    public async run(actions: Action[], cancellationToken?: { isCancellationRequested: boolean }): Promise<void> {
        const context: ActionContext = {
            multipleActions: actions.length > 1,
            yesAll: false,
            overwriteAll: false,
            keepBothAll: false,
            skipAll: false,
            cancelled: false
        };

        for (const action of actions) {
            if (cancellationToken?.isCancellationRequested) {
                this.logger.warn("Actions cancelled");
                return;
            }

            try {
                await action.execute(context);
                this.logger.log(`${action.toString()}`);
            } catch (error) {
                this.logger.error(`Error running ${action.toString()}: ${JSON.stringify(error)}`);
            }
        }
    }
}