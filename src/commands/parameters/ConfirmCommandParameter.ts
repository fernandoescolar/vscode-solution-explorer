import * as vscode from "vscode";
import { ICommandParameter } from "../base/ICommandParameter";

export class ConfirmCommandParameter implements ICommandParameter {
    private value: string;

    constructor(private readonly message: string) {
    }

    public async setArguments(): Promise<boolean> {
        let option = await vscode.window.showWarningMessage(this.message, 'Yes');
        if (option !== null && option !== undefined && option == 'Yes') {
            return true;
        }

        return false;
    }

    public getArguments(): string[] {
        return [ ];
    }
}