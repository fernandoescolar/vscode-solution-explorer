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

    panel.webview.html = this.getWebViewContent(
      this.context,
      'webviews/create-project/dist/index.html'
    )
  }

  getWebViewContent(context: vscode.ExtensionContext, templatePath: string) {
    const resourcePath = path.join(context.extensionPath, templatePath)
    const dirPath = path.dirname(resourcePath)
    let html = fs.readFileSync(resourcePath, 'utf-8')
    html = html.replace(
      /(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g,
      (m, $1, $2) => {
        return (
          $1 +
          vscode.Uri.file(path.resolve(dirPath, $2))
            .with({ scheme: 'vscode-resource' })
            .toString() +
          '"'
        )
      }
    )
    return html
  }

  public toString(): string {
    return `Create new project`
  }
}
