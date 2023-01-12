import * as dialogs from "@extensions/dialogs";
import { Action, ActionContext } from "./base/Action";

type  DeleteMultipleItemsOptions = 'Yes' | 'Skip' | 'Cancel';

export class DeleteMultipleItems implements Action {
    constructor(private readonly deleteActions: Action[], private operationDescription: string) {
    }

    public toString(): string {
        return this.operationDescription[0].toUpperCase() + this.operationDescription.substring(1);
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) {
            return;
        }

        const option = await this.showOptions(context);
        if (option === 'Yes') {
            for (const deleteAction of this.deleteActions) {
                deleteAction.execute(context);
            }
        }
    }

    private async showOptions(context: ActionContext): Promise<DeleteMultipleItemsOptions> {
        const options = ['Yes', 'Skip'];
        if (context.yesAll) {
            return 'Yes';
        }

        if (context.skipAll) {
            return 'Skip';
        }

        if (context.multipleActions) {
            options.push('Yes All', 'Skip All');
        }

        const option = await dialogs.confirm(`Are you sure you want to ${this.operationDescription}?`, ...options);

        if (option === 'Yes All') {
            context.yesAll = true;
            return 'Yes';
        }

        if (option === 'Skip All') {
            context.skipAll = true;
            return 'Skip';
        }

        if (!option) {
            return 'Cancel';
        }

        return option as DeleteMultipleItemsOptions;
    }
}
