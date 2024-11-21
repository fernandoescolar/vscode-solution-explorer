import * as vscode from "vscode";

export interface ICodeDecorator {
    get filter(): vscode.DocumentSelector;
    decorate(editor: vscode.TextEditor): void | Promise<void>;
}