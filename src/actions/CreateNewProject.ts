import * as vscode from 'vscode'
import { Action, ActionContext } from './base/Action'
import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import { TaskManager } from '@extensions/taskManager'

type ProjectType = { name: string; value: string; languages: string[] }
const PROJECT_TYPES: ProjectType[] = [
  // { name: 'Console application', value: 'console', languages: ['C#', 'F#', 'VB'] },
  // { name: 'Class library', value: 'classlib', languages: ['C#', 'F#', 'VB'] },
  // { name: 'WPF Application', value: 'wpf', languages: ['C#'] },
  // { name: 'WPF Class library', value: 'wpflib', languages: ['C#'] },
  // { name: 'WPF Custom Control Library', value: 'wpfcustomcontrollib', languages: ['C#'] },
  // { name: 'WPF User Control Library', value: 'wpfusercontrollib', languages: ['C#'] },
  // { name: 'Windows Forms (WinForms) Application', value: 'winforms', languages: ['C#'] },
  // { name: 'Windows Forms (WinForms) Class library', value: 'winformslib', languages: ['C#'] },
  // { name: 'Worker Service', value: 'worker', languages: ['C#'] },
  // { name: 'Unit test project', value: 'mstest', languages: ['C#', 'F#', 'VB'] },
  // { name: 'xUnit test project', value: 'xunit', languages: ['C#', 'F#', 'VB'] },
  // { name: 'NUnit 3 Test Project', value: 'nunit', languages: ['C#', 'F#', 'VB'] },
  // { name: 'ASP.NET Core empty', value: 'web', languages: ['C#', 'F#'] },
  // { name: 'ASP.NET Core Web App (Model-View-Controller)', value: 'mvc', languages: ['C#', 'F#'] },
  // { name: 'ASP.NET Core Web App', value: 'razor', languages: ['C#'] },
  // { name: 'ASP.NET Core with Angular', value: 'angular', languages: ['C#'] },
  // { name: 'ASP.NET Core with React.js', value: 'react', languages: ['C#'] },
  // { name: 'ASP.NET Core with React.js and Redux', value: 'reactredux', languages: ['C#'] },
  // { name: 'ASP.NET Core Web API', value: 'webapi', languages: ['C#', 'F#'] },
  // { name: 'ASP.NET Core gRPC Service', value: 'grpc', languages: ['C#'] },
  // { name: 'Blazor Server App', value: 'blazorserver', languages: ['C#'] },
  // { name: 'Blazor WebAssembly App', value: 'blazorwasm', languages: ['C#'] },
  // { name: 'Razor Class Library', value: 'razorclasslib', languages: ['C#'] },
]

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

    this.loadProjectTemplates()

    const panel = vscode.window.createWebviewPanel(
      'create-project',
      'Create project',
      vscode.ViewColumn.One,
      { enableScripts: true }
    )
    postMessage(panel, 'setProjectTemplates', PROJECT_TYPES)

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
        let step1 = new vscode.Task(
          { type: 'dotnet', task: `dotnet new` },
          vscode.TaskScope.Workspace,
          'Solution Explorer',
          'dotnet',
          new vscode.ShellExecution(
            `dotnet new ${message.value.projectType} -lang ${
              message.value.projectLanguage
            } -n ${message.value.projectName} -o ${
              message.value.folderName
            } ${message.value.additionalInfo.join(' ')}`
          )
        )
        taskManager.addTask(step1)
        let step2 = new vscode.Task(
          { type: 'dotnet', task: `dotnet sln` },
          vscode.TaskScope.Workspace,
          'Solution Explorer',
          'dotnet',
          new vscode.ShellExecution('dotnet', [
            'sln',
            this.curPath,
            'add',
            projectPath
          ])
        )
        taskManager.addTask(step2)
      }
    })

    panel.webview.html = getWebViewContent(
      this.context,
      'webviews/create-project/dist/index.html'
    )
  }

  private loadProjectTemplates(): void {
    if (PROJECT_TYPES.length > 0) {
      return
    }

    let buffer = execSync('dotnet new --list')
    if (!buffer) {
      return
    }

    let lines = buffer.toString().split('\n')
    if (lines.length > 4) {
      lines.splice(0, 4) /* ignore header */
      lines.forEach(line => {
        let parts = line.split('  ').filter(element => element)
        if (parts.length > 2) {
          const projectType = {
            name: parts[0].trim(),
            value: parts[1].trim(),
            languages: parts[2]
              .split(',')
              .map(element => element.trim().replace('[', '').replace(']', ''))
          }
          if (projectType.languages.length > 0) {
            PROJECT_TYPES.push(projectType)
          }
        }
      })
    }
  }

  public toString(): string {
    return `Create new project`
  }
}
