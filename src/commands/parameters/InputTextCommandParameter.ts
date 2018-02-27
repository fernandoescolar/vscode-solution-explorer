import * as vscode from "vscode";
import { ICommandParameter } from "../base/ICommandParameter";

export class InputTextCommandParameter implements ICommandParameter {
    private value: string;

    constructor(private readonly placeholder: string, private readonly option?: string, private readonly initialValue?: string) {
    }

    public async setArguments(): Promise<boolean> {
        let value = await vscode.window.showInputBox({ placeHolder: this.placeholder, value: this.initialValue });
        if (value !== null && value !== undefined) {
            this.value = value;
            return true;
        }

        return false;
    }

    public getArguments(): string[] {
        if (this.option)
            return [ this.option, this.value ];

        return [ this.value ];
    }

}