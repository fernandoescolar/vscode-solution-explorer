import * as vscode from "vscode";
import * as config from "@extensions/config";
import { NugetVersionCodeActionProvider } from "./actions/NugetVersionCodeActionProvider";
import { NugetNameCompletionItemProvider } from "./completions/NugetNameCompletionItemProvider";
import { NugetVersionCompletionItemProvider } from "./completions/NugetVersionCompletionItemProvider";
import { CodeDecoratorController } from "./decorators/CodeDecoratorController";
import { PACKAGE_REFERENCE_FILTER, PACKAGE_VERSION_FILTER } from "./filters";
import { NugetVersionDecorator } from "./decorators/NugetVersionDecorator";

export class LanguageExtensions {
  constructor(private readonly context: vscode.ExtensionContext) {}

  register() {
    const fileTypes = [
      { filter: PACKAGE_REFERENCE_FILTER, tagName: "PackageReference"},
      { filter: PACKAGE_VERSION_FILTER, tagName: "PackageVersion"}
    ];

    this.context.subscriptions.push(
      vscode.commands.registerCommand("solutionExplorer.updatePackageVersionInline", async (startPosition: vscode.Position, endPosition: vscode.Position, version: string) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          return;
        }

        const range = new vscode.Range(startPosition, endPosition);
        await editor.edit(editBuilder => {
          editBuilder.replace(range, `"${version}"`);
        });

        editor.selection = new vscode.Selection(startPosition, endPosition);
      })
    );

    fileTypes.forEach(({ filter, tagName }) => {
      if (config.getNugetCodeDecorators()) {
        const decorator = new CodeDecoratorController(this.context, [
          new NugetVersionDecorator(filter, tagName),
        ]);
        decorator.register();
      }

      if (config.getNugetCodeActions()) {
        this.context.subscriptions.push(
          vscode.languages.registerCodeActionsProvider(
            filter,
            new NugetVersionCodeActionProvider(tagName)
          )
        );
      }

      if (config.getNugetCodeCompletions()) {
        this.context.subscriptions.push(
          vscode.languages.registerCompletionItemProvider(
            filter,
            new NugetNameCompletionItemProvider(tagName),
            ".",
            '"'
          )
        );

        this.context.subscriptions.push(
          vscode.languages.registerCompletionItemProvider(
            filter,
            new NugetVersionCompletionItemProvider(tagName),
            '"'
          )
        );
      }
    });
  }
}
