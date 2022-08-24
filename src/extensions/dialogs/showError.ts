import * as vscode from "vscode";

export async function showError(error: Error | string) : Promise<void> {
    if (typeof error !== "string") {
        error = error.message;
    }

    await vscode.window.showErrorMessage(error);
}