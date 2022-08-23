import * as vscode from "vscode";

export function readText(): Promise<string> {
    return new Promise((resolve, reject) =>  vscode.env.clipboard.readText().then(text => resolve(text), err => reject(err)));
}

export function writeText(text: string): Promise<void> {
    return new Promise((resolve, reject) => vscode.env.clipboard.writeText(text).then(() => resolve(), err => reject(err)));
}

