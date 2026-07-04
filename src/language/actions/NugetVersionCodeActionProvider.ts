import * as vscode from "vscode";
import * as nuget from '@extensions/nuget';

export class NugetVersionCodeActionProvider implements vscode.CodeActionProvider {
    private readonly regEx: RegExp;

    constructor(tagName: string) {
        this.regEx = new RegExp(`<${tagName} Include="(.+)" Version="([0-9A-Za-z-.]+)"`);
    }

    async provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): Promise<(vscode.CodeAction | vscode.Command)[] | null | undefined> {
        const line = document.lineAt(range.start.line).text;
        const match = this.regEx.exec(line);
        if (!match) {
            return undefined;
        }
        const id = match[1];
        const version = match[2];
        const versionIndex = line.indexOf(version);
        const versions = await nuget.searchPackageVersions(document.uri.fsPath, id);
        const actionKind = vscode.CodeActionKind.RefactorRewrite;
        const actions = versions.map((v, i) => {
            const action = new vscode.CodeAction(`${v}`, actionKind);
            action.edit = new vscode.WorkspaceEdit();
            action.edit.replace(document.uri, new vscode.Range(range.start.line, versionIndex, range.start.line, versionIndex + version.length), v);

            if (i === 0) {
                action.title = `${v} (latest)`;
            }

            if (v === version) {
                action.title = `${v} (current)`;
            }


            return action;
        });

        return actions;
    }
}
