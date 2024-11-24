import * as vscode from "vscode";

export async function openSolutionFile(label: string): Promise<string | undefined> {
    const uris = await vscode.window.showOpenDialog({
        openLabel: label,
        canSelectFolders: false,
        canSelectMany: false,
        filters: { ['Solution files']: [ 'sln', 'slnx' ] }
    });

    if (uris !== undefined && uris.length > 0) {
        return uris[0].fsPath;
    }
}