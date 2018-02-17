import * as vscode from "vscode";
import { ICommandParameter } from "../base/ICommandParameter";

export class OpenFileCommandParameter implements ICommandParameter {
    private value: string;

    constructor(private readonly okLabel?: string, private readonly option?: string) {
    }

    public async setArguments(): Promise<boolean> {
        let options: vscode.OpenDialogOptions = {
		    openLabel: this.okLabel,
    		canSelectFolders: false,
    		canSelectMany: false,
		    filters: { 'Projects': [ 'csproj', 'vbproj', 'fsproj' ] }
        };

        let uris = await vscode.window.showOpenDialog(options);
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