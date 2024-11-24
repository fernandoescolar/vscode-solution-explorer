import * as vscode from "vscode";
import { ICodeDecorator } from "./ICodeDecorator";

export class CodeDecoratorController {
    private timeout: NodeJS.Timer | number | undefined = undefined;

    constructor(private readonly context: vscode.ExtensionContext, private readonly decorators: ICodeDecorator[]) {
    }

    register() {
        let activeEditor = vscode.window.activeTextEditor;
        vscode.window.onDidChangeActiveTextEditor(editor => {
            activeEditor = editor;
            if (editor) {
                this.triggerUpdateDecorations(editor);
            }
        }, null, this.context.subscriptions);

        vscode.workspace.onDidChangeTextDocument(event => {
            if (activeEditor && event.document === activeEditor.document) {
                this.triggerUpdateDecorations(activeEditor, true);
            }
        }, null, this.context.subscriptions);

        if (activeEditor) {
            this.triggerUpdateDecorations(activeEditor);
        }
    }

    private updateDecorations(activeEditor: vscode.TextEditor) {
		if (!activeEditor) {
			return;
		}

		this.decorators.forEach(decorator => {
            if (decorator.filter && vscode.languages.match(decorator.filter, activeEditor.document)) {
                decorator.decorate(activeEditor);
            }
        });
	}

	private triggerUpdateDecorations(activeEditor: vscode.TextEditor, throttle = false) {
		if (this.timeout) {
			clearTimeout(this.timeout as number);
			this.timeout = undefined;
		}

		if (throttle) {
			this.timeout = setTimeout(() => this.updateDecorations(activeEditor), 500);
		} else {
			this.updateDecorations(activeEditor);
		}
	}
}
