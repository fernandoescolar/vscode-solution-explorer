import { ExtensionContext } from 'vscode'
import { TreeItem } from '@tree'
import { Action, ManageNuGet } from '@actions'
import { ActionsCommand } from '@commands'
import { SolutionExplorerProvider } from '@SolutionExplorerProvider'

export class ManageNuGetCommand extends ActionsCommand {
  constructor(private readonly context: ExtensionContext, private readonly provider: SolutionExplorerProvider) {
    super('Open NuGet Management')
  }

  public shouldRun(item: TreeItem): boolean {
    return item && !!item.project && item.project.type === 'cps';
  }

  public async getActions(item: TreeItem): Promise<Action[]> {
    if (!item || !item.project) { return []; }

    return Promise.resolve([new ManageNuGet(this.context)])
  }
}
