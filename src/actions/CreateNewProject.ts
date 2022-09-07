import * as vscode from 'vscode'
import { Action, ActionContext } from './base/Action'
import * as fs from 'fs'
import * as path from 'path'

export class CreateNewProject implements Action {
  constructor(private readonly context: vscode.ExtensionContext) {}

  public async execute(context: ActionContext): Promise<void> {
    if (context.cancelled) {
      return
    }

    const panel = vscode.window.createWebviewPanel(
      'create-project',
      'Create project',
      vscode.ViewColumn.One,
      { enableScripts: true }
    )

    let html = fs.readFileSync(
      path.join(
        this.context.extensionPath,
        'webviews/create-project/dist',
        'index.html'
      ),
      'utf8'
    )
    panel.webview.html = html
  }

  public toString(): string {
    return `Create new project`
  }
}
