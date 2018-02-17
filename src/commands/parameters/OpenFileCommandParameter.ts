import * as vscode from "vscode";
import { ICommandParameter } from "../base/ICommandParameter";

export class OpenFileCommandParameter implements ICommandParameter {
    private value: string;

    constructor(private readonly options: vscode.OpenDialogOptions, private readonly option?: string) {
    }

    public async setArguments(): Promise<boolean> {
        let uris = await vscode.window.showOpenDialog(this.options);
        if (uris !== null && uris.length == 1) {
            this.value = uris[0].fsPath;
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