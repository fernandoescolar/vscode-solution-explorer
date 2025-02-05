import * as vscode from "vscode";
import * as nuget from '@extensions/nuget';

export class NugetVersionCompletionItemProvider implements vscode.CompletionItemProvider {
    private readonly regEx: RegExp;

    constructor(tagName: string) {
        this.regEx = new RegExp(`<${tagName} Include="([^"\n]*)`);
    }

    async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): Promise<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem> | null | undefined> {
        const linePrefix = document.lineAt(position).text.substr(0, position.character);
        const match = this.regEx.exec(linePrefix);
        if (!match) {
          return undefined;
        }
        const id = match[1];
        if (!linePrefix.endsWith("Version=\"")) {
            return undefined;
        }

        const items = await nuget.searchPackageVersions(document.uri.fsPath, id);
        return this.mapToCompletionItems(id, items);
    }

    private mapToCompletionItems(id: string, versions: string[]): vscode.CompletionItem[] {
        return versions.map(version => {
            const completionItem = new vscode.CompletionItem(version);
            completionItem.kind = vscode.CompletionItemKind.Value;
            completionItem.sortText = version.split('.').map(v => (99999 - parseInt(v)).toString().padStart(5, '0')).join('.');
            completionItem.insertText = new vscode.SnippetString(`${id} ${version}"`);
            completionItem.detail = `${version}`;

            return completionItem;
        });
    }
}
