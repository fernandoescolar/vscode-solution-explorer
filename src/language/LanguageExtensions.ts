import * as vscode from "vscode";
import { NugetVersionCodeActionProvider } from "./actions/NugetVersionCodeActionProvider";
import { NugetNameCompletionItemProvider } from "./completions/NugetNameCompletionItemProvider";
import { NugetVersionCompletionItemProvider } from "./completions/NugetVersionCompletionItemProvider";
import { CodeDecoratorController } from "./decorators/CodeDecoratorController";
import { CSPROJ } from "./filters";
import { NugetVersionDecorator } from "./decorators/NugetVersionDecorator";

export class LanguageExtensions {

    constructor(private readonly context: vscode.ExtensionContext) {
    }

    register() {
        const decorator = new CodeDecoratorController(this.context, [
            new NugetVersionDecorator()
        ]);
        decorator.register();

        this.context.subscriptions.push(vscode.languages.registerCodeActionsProvider(
            CSPROJ,
            new NugetVersionCodeActionProvider(),
        ));

        this.context.subscriptions.push(vscode.languages.registerCompletionItemProvider(
            CSPROJ,
            new NugetNameCompletionItemProvider(),
            '.', '"'
        ));

        this.context.subscriptions.push(vscode.languages.registerCompletionItemProvider(
            CSPROJ,
            new NugetVersionCompletionItemProvider(),
            '.', '"'
        ));
    }

}
