import * as vscode from "vscode";

export async function openReferenceFile(label: string): Promise<string[] | undefined> {
    const uris = await vscode.window.showOpenDialog({
        openLabel: label,
        canSelectFolders: false,
        canSelectMany: true,
        filters: {
            'Assembly': ['dll']
        }
    });

    if (uris !== undefined && uris.length > 0) {
        return uris.map(u => u.fsPath);
    }
}