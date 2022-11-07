import { ExtensionContext } from 'vscode'
import { ContextValues, TreeItem } from '@tree'
import { Action, CreateNewProject } from '@actions'
import { ActionsCommand } from '@commands'

type ProjectType = { name: string; value: string; languages: string[] }

export class CreateNewProjectCommand extends ActionsCommand {
  constructor(private readonly context: ExtensionContext) {
    super('Create a new project')
  }

  public shouldRun(item: TreeItem): boolean {
    return (
      item &&
      !!item.path &&
      (item.contextValue === ContextValues.solution ||
        item.contextValue === ContextValues.solution + '-cps')
    )
  }

  public async getActions(item: TreeItem): Promise<Action[]> {
    if (!item || !item.path) {
      return []
    }

    return Promise.resolve([new CreateNewProject(this.context, item.path)])
  }
}
