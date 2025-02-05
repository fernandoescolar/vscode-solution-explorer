import * as vscode from "vscode";
import * as nuget from '@extensions/nuget';

export class NugetNameCompletionItemProvider implements vscode.CompletionItemProvider {
    private readonly regEx: RegExp;

    constructor(tagName: string) {
        this.regEx = new RegExp(`<${tagName} Include="([^"\n]*)$`);
    }

    async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): Promise<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem> | null | undefined> {
        const linePrefix = document.lineAt(position).text.substr(0, position.character);
        const match = this.regEx.exec(linePrefix);
        if (!match) {
          return undefined;
        }

        const items = await nuget.searchPackagesByName(document.uri.fsPath, match[1]);
        return new vscode.CompletionList(this.mapToCompletionItems(items), false);
    }

    private mapToCompletionItems(pkgs: nuget.NugetPackage[]): vscode.CompletionItem[] {
        return pkgs.map(pkg => {
            const completionItem = new vscode.CompletionItem(pkg.id);
            completionItem.kind = vscode.CompletionItemKind.Keyword;
            completionItem.insertText = new vscode.SnippetString(`${pkg.id} v${pkg.version}"`);
            completionItem.detail = `latest: ${pkg.version}`;
            completionItem.documentation = `${pkg.description}`;

            return completionItem;
        });
    }
}

