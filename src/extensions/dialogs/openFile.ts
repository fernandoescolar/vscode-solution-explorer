import * as vscode from "vscode";


export async function openFile(label: string): Promise<string | undefined> {
    const uris = await vscode.window.showOpenDialog({
        openLabel: label,
        canSelectFolders: false,
        canSelectMany: false,
        filters: { ['Files']: [ '*' ] }
    });

    if (uris !== undefined && uris.length > 0) {
        return uris[0].fsPath;
    }
}
