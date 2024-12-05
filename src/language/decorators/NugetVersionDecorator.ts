import * as vscode from "vscode";
import * as nuget from "@extensions/nuget";
import { ICodeDecorator } from "./ICodeDecorator";
import { CSPROJ, NUGETDECLARATIONS } from "../filters";

export class NugetVersionDecorator implements ICodeDecorator
{
    private okType = vscode.window.createTextEditorDecorationType({
        after: {
            contentText: "✅",
            margin: "0 0 0 0",
            color: new vscode.ThemeColor("editorLineNumber.foreground"),
            fontWeight: "bold",
            fontStyle: "underline",
        }
    });
    private newType = vscode.window.createTextEditorDecorationType({
        after: {
            contentText: "🆕",
            margin: "0 0 0 0",
            color: new vscode.ThemeColor("editorLineNumber.foreground"),
            fontWeight: "bold",
            fontStyle: "underline",
        }
    });

    get filter(): vscode.DocumentSelector {
        return NUGETDECLARATIONS;
    }

    async decorate(editor: vscode.TextEditor): Promise<void> {
        const text = editor.document.getText();
        const okDecorations: vscode.DecorationOptions[] = [];
        const newDecorations: vscode.DecorationOptions[] = [];
        const regEx = /<Package(?:Reference|Version) Include="(.+)" Version="(.+)"/g;
        let match;
        while ((match = regEx.exec(text))) {
            const id = match[1];
            const version = match[2];
            const versions = await nuget.searchPackageVersions(editor.document.uri.fsPath, id);
            if (!versions || versions.length === 0) {
                continue;
            }

            const isNew = versions[0] !== version;
            const hoverMessage = isNew ? `Version ${version} is outdated` : `Version ${version} is up-to-date`;
            const startPos = editor.document.positionAt(match.index);
            const endPos = editor.document.positionAt(match.index + match[0].length);
            const decoration = { range: new vscode.Range(startPos, endPos), hoverMessage };

            if (isNew) {
                newDecorations.push(decoration);
            } else {
                okDecorations.push(decoration);
            }
        }

        editor.setDecorations(this.okType, okDecorations);
        editor.setDecorations(this.newType, newDecorations);
    }
}