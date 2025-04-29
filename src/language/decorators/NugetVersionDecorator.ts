import * as vscode from "vscode";
import * as nuget from "@extensions/nuget";
import { ICodeDecorator } from "./ICodeDecorator";

const okType = vscode.window.createTextEditorDecorationType({
    isWholeLine: false,
    cursor: "pointer",
    after: {
        contentText: "✅",
        margin: "0 0 0 0",
        color: new vscode.ThemeColor("editorLineNumber.foreground"),
        fontWeight: "bold",
        fontStyle: "underline",
    }
});

const newType = vscode.window.createTextEditorDecorationType({
    isWholeLine: false,
    cursor: "pointer",
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
    after: {
        contentText: "🆕",
        margin: "0 0 0 0",
        color: new vscode.ThemeColor("editorLineNumber.foreground"),
        fontWeight: "bold",
        fontStyle: "underline",
    }
});

export class NugetVersionDecorator implements ICodeDecorator
{
    private readonly regEx: RegExp;

    constructor(public readonly filter: vscode.DocumentSelector, tagName: string) {
        this.regEx = new RegExp(`<${tagName} Include="(.+)" Version="([0-9A-Za-z-.]+)"`, "g");
    }

    async decorate(editor: vscode.TextEditor): Promise<void> {
        const text = editor.document.getText();
        const okDecorations: vscode.DecorationOptions[] = [];
        const newDecorations: vscode.DecorationOptions[] = [];
        let match;
        while ((match = this.regEx.exec(text))) {
            const id = match[1];
            const version = match[2];
            const versions = await nuget.searchPackageVersions(editor.document.uri.fsPath, id);
            if (!versions || versions.length === 0) {
                continue;
            }

            const isNew = nuget.comparePackageVersions(version, versions[0]) > 0;
            const versionIndex = match.index + match[0].indexOf(version);
            const startPos = editor.document.positionAt(versionIndex - 1);
            const endPos = editor.document.positionAt(versionIndex + match[2].length + 1);
            const hoverMessage = NugetVersionDecorator.getHoverMessage(id, versions, version, startPos, endPos, isNew);
            const decoration = { range: new vscode.Range(startPos, endPos), hoverMessage };

            if (isNew) {
                newDecorations.push(decoration);
                editor.setDecorations(newType, newDecorations);
            } else {
                okDecorations.push(decoration);
                editor.setDecorations(okType, okDecorations);
            }
        }

        editor.setDecorations(newType, newDecorations);
        editor.setDecorations(okType, okDecorations);
    }

    static getHoverMessage(name: string, versions: string[], version: string, startPos: vscode.Position, endPos: vscode.Position, isNew: boolean): vscode.MarkdownString {
        let message = "Versions:";
        versions.forEach(v => {
            const args = [startPos, endPos, v];
            const command = vscode.Uri.parse(`command:solutionExplorer.updatePackageVersionInline?${encodeURIComponent(JSON.stringify(args))}`);
            if (v === version) {
                message += `\r\n- **${v}** *current*`;
            } else {
                message += `\r\n- [${v}](${command})`;
            }
        });

        const contents = new vscode.MarkdownString(message);
        contents.isTrusted = true;

        return contents;
    }
}