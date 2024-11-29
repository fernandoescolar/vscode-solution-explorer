import * as vscode from "vscode";
import { NugetVersionCodeActionProvider } from "./actions/NugetVersionCodeActionProvider";
import { NugetNameCompletionItemProvider } from "./completions/NugetNameCompletionItemProvider";
import { NugetVersionCompletionItemProvider } from "./completions/NugetVersionCompletionItemProvider";
import { CodeDecoratorController } from "./decorators/CodeDecoratorController";
import { CSPROJ, PACKAGES_PROPS } from "./filters";
import { NugetVersionDecorator } from "./decorators/NugetVersionDecorator";

export class LanguageExtensions {

    constructor(private readonly context: vscode.ExtensionContext) {
    }

    register() {
        const fileTypes = [
            { filter: CSPROJ, tagName: "PackageReference"},
            { filter: PACKAGES_PROPS, tagName: "PackageVersion"}
        ];

        const decorator = new CodeDecoratorController(this.context,
            fileTypes.map(({filter, tagName}) => new NugetVersionDecorator(filter, tagName))
        );
        decorator.register();

        fileTypes.forEach(({filter, tagName}) => {
            this.context.subscriptions.push(vscode.languages.registerCodeActionsProvider(
                filter,
                new NugetVersionCodeActionProvider(tagName),
            ));

            this.context.subscriptions.push(vscode.languages.registerCompletionItemProvider(
                filter,
                new NugetNameCompletionItemProvider(tagName),
                '.', '"'
            ));

            this.context.subscriptions.push(vscode.languages.registerCompletionItemProvider(
                filter,
                new NugetVersionCompletionItemProvider(tagName),
                '.', '"'
            ));
        });
    }

}
