import * as vscode from 'vscode'
import { Action, ActionContext } from './base/Action'
import { VSCExpress } from 'vscode-express'
import fetch from 'node-fetch'
import { TaskManager } from '@extensions/taskManage'
import parseProject from '@extensions/parseProject'
import { getNuGetSources } from '@extensions/config'

function postMessage(panel: vscode.WebviewPanel, command: string, payload: object) {
  panel.webview.postMessage({ command: command, payload: payload })
}

function loadProjects(panel: vscode.WebviewPanel) {
  vscode.workspace.findFiles('**/*.{csproj,fsproj,vbproj}').then(files => {
    let projects = Array()
    files
      .map(x => x.fsPath)
      .forEach(async x => {
        let project = await parseProject(x)
        projects.push(project)
      })
    postMessage(
      panel,
      'setProjects',
      projects.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
    )
  })
}

export class ManageNuGet implements Action {
  constructor(private readonly context: vscode.ExtensionContext) {}

  public async execute(context: ActionContext): Promise<void> {
    if (context.cancelled) {
      return
    }

    const vscexpress = new VSCExpress(this.context, 'out/nuget-management')
    let panel = vscexpress.open('index.html', 'NuGet Management', vscode.ViewColumn.One)

    let taskManager = new TaskManager(vscode.tasks.executeTask, (e: any) => {
      if (e.name === 'Solution Explorer' && e.remaining === 0) {
        loadProjects(panel)
      }
    })
    vscode.tasks.onDidEndTask(e => taskManager.handleDidEndTask(e))

    vscode.commands.registerCommand(
      'solutionExplorer.httpRequest',
      async (uri: string, args: any) => {
        let resData = ''
        if (args) {
          let paramsArray: string[] = []
          Object.keys(args).forEach(key => paramsArray.push(key + '=' + args[key]))
          if (uri.search(/\?/) === -1) {
            uri += '?' + paramsArray.join('&')
          } else {
            uri += '&' + paramsArray.join('&')
          }
        }
        resData = await fetch(uri)
          .then(res => res.text())
          .then(json => json)
        return resData
      }
    )

    vscode.commands.registerCommand('solutionExplorer.reloadProjects', async () => {
      let res = await vscode.workspace.findFiles('**/*.{csproj,fsproj,vbproj}').then(async files => {
        let projects = Array()
        let fileList = files.map(x=>x.fsPath)
        for (let index = 0; index < fileList.length; index++) {
          projects.push(await parseProject(fileList[index]))
        }
        return projects.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
      })
      return res
    })

    vscode.commands.registerCommand('solutionExplorer.reloadSources', async () => {
      return getNuGetSources()
    })

    vscode.commands.registerCommand('solutionExplorer.manageNugetPackages', (info: any) => {
      for (let i = 0; i < info.projects.length; i++) {
        const project = info.projects[i]
        let args = [info.command, project.projectPath.replace(/\\/g, '/'), 'package', info.package]

        if (info.command === 'add') {
          args.push('-v')
          args.push(info.version)
        }
        let task = new vscode.Task(
          { type: 'dotnet', task: `dotnet ${info.command}` },
          'Solution Explorer',
          'dotnet',
          new vscode.ShellExecution('dotnet', args)
        )
        taskManager.addTask(task)
      }
    })
  }

  public toString(): string {
    return `Open NuGet Management`
  }
}
