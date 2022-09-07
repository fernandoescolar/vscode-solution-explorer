import * as vscode from 'vscode'
import { Action, ActionContext } from './base/Action'
import * as fs from 'fs'
import * as path from 'path'
import { TaskManager } from '@extensions/taskManager'

function postMessage(
  panel: vscode.WebviewPanel,
  command: string,
  payload: object
) {
  panel.webview.postMessage({ command: command, payload: payload })
}
function getWebViewContent(
  context: vscode.ExtensionContext,
  templatePath: string
) {
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
export class CreateNewProject implements Action {
  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly curPath: string
  ) {}

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

    let taskManager = new TaskManager(vscode.tasks.executeTask, (e: any) => {
      if (e.name === 'create-project' && e.remaining === 0) {
        console.log('123')
      }
    })
    vscode.tasks.onDidEndTask(e => taskManager.handleDidEndTask(e))

    panel.webview.onDidReceiveMessage(async message => {
      if (message.command === 'createProject') {
        const workingpath = path.dirname(this.curPath)
        let projectPath = path.join(
          workingpath,
          message.value.folderName,
          message.value.projectName
        )
        if (message.value.projectLanguage === 'C#') {
          projectPath += '.csproj'
        }
        if (message.value.projectLanguage === 'F#') {
          projectPath += '.fsproj'
        }
        if (message.value.projectLanguage === 'VB') {
          projectPath += '.vbproj'
        }
        let task = new vscode.Task(
          { type: 'dotnet', task: `dotnet new` },
          vscode.TaskScope.Workspace,
          'Solution Explorer',
          'dotnet',
          new vscode.ShellExecution('dotnet', [
            'new',
            message.value.projectType,
            '-lang',
            message.value.projectLanguage,
            '-n',
            message.value.projectName,
            '-o',
            message.value.folderName
          ])
        )
        taskManager.addTask(task)
      }
    })

    panel.webview.html = getWebViewContent(
      this.context,
      'webviews/create-project/dist/index.html'
    )
  }

  public toString(): string {
    return `Create new project`
  }
}
