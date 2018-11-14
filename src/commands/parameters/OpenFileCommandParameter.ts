import * as vscode from "vscode";
import { ICommandParameter } from "../base/ICommandParameter";
import { CommandParameterCompiler } from "../base/CommandParameterCompiler";

export class OpenFileCommandParameter implements ICommandParameter {
    private value: string;

    constructor(private readonly options: vscode.OpenDialogOptions, private readonly option?: string) {
    }

    public get shouldAskUser(): boolean { return true; }

    public async setArguments(state: CommandParameterCompiler): Promise<void> {
        let uris = await vscode.window.showOpenDialog(this.options);
        if (uris !== null && uris.length == 1) {
            this.value = uris[0].fsPath;
            state.next();
        }

        state.cancel();
    }

    public getArguments(): string[] {
        if (this.option)
            return [ this.option, this.value ];

        return [ this.value ];
    }

}