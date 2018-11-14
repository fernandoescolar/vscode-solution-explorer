import * as vscode from "vscode";
import { ICommandParameter } from "../base/ICommandParameter";
import { CommandParameterCompiler } from "../base/CommandParameterCompiler";

export class ConfirmCommandParameter implements ICommandParameter {
    private value: string;

    constructor(private readonly message: string) {
    }

    public get shouldAskUser(): boolean { return true; }

    public async setArguments(state: CommandParameterCompiler): Promise<void> {
        let option = await vscode.window.showWarningMessage(this.message, 'Yes', 'No');
        if (option !== null && option !== undefined && option == 'Yes') {
            state.next();
        }

        state.cancel();
    }

    public getArguments(): string[] {
        return [ ];
    }
}