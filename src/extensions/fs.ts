import * as vscode from 'vscode';

export async function copy(sourcePath: string, targetPath: string): Promise<void> {
    const sourceUri = vscode.Uri.file(sourcePath);
    const targetUri = vscode.Uri.file(targetPath);
    await vscode.workspace.fs.copy(sourceUri, targetUri, { overwrite: true });
}

export async function exists(path: string): Promise<boolean> {
    const uri = vscode.Uri.file(path);
    try {
        await vscode.workspace.fs.stat(uri);
        return true;
    } catch (e) {
        return false;
    }
}

export async function readFile(path: string): Promise<string> {
    const uri = vscode.Uri.file(path);
    const bytes = await vscode.workspace.fs.readFile(uri);
    return new TextDecoder().decode(bytes);
}

export async function writeFile(path: string, content: string): Promise<void> {
    const uri = vscode.Uri.file(path);
    await vscode.workspace.fs.writeFile(uri, new TextEncoder().encode(content));
}

export async function unlink(path: string): Promise<void> {
    const uri = vscode.Uri.file(path);
    await vscode.workspace.fs.delete(uri, { useTrash: true });
}

export async function mkdir(path: string): Promise<void> {
    const uri = vscode.Uri.file(path);
    await vscode.workspace.fs.createDirectory(uri);
}

export async function rmdirRecursive(path: string): Promise<void> {
    const uri = vscode.Uri.file(path);
    await vscode.workspace.fs.delete(uri, { useTrash: true, recursive: true });
}

export async function rename(sourcePath: string, targetPath: string): Promise<void> {
    const sourceUri = vscode.Uri.file(sourcePath);
    const targetUri = vscode.Uri.file(targetPath);
    await vscode.workspace.fs.rename(sourceUri, targetUri);
}

export async function isDirectory(path: string): Promise<boolean> {
    const uri = vscode.Uri.file(path);
    const stat = await vscode.workspace.fs.stat(uri);
    return stat.type === vscode.FileType.Directory;
}

export async function readdir(path: string): Promise<string[]> {
    const uri = vscode.Uri.file(path);
    const items = await vscode.workspace.fs.readDirectory(uri);
    return items.map(item => item[0]);
}
