import * as vscode from "vscode";
import { ICommandParameter, CommandParameterCompiler } from "@commands/base";

export class ConfirmCommandParameter implements ICommandParameter {
    constructor(private readonly message: string) {
    }

    public get shouldAskUser(): boolean { return true; }

    public async setArguments(state: CommandParameterCompiler): Promise<void> {
        let option = await vscode.window.showWarningMessage(this.message, 'Yes', 'No');
        if (option !== null && option !== undefined && option === 'Yes') {
            state.next();
        }

        state.cancel();
    }

    public getArguments(): string[] {
        return [ ];
    }
}