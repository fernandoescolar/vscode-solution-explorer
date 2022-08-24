import * as vscode from "vscode";

export async function confirm<T extends string>(message: string, ...options: T[]): Promise<T | undefined> {
    const option = await vscode.window.showWarningMessage(message, { modal: true }, ...options);
    return option;
}