import * as dialogs from "@extensions/dialogs";
import { ContextValues, TreeItem } from "@tree";
import { Action, DotNetAddExistingProject } from "@actions";
import { SingleItemActionsCommand } from "@commands";
import { SolutionExplorerProvider } from "@SolutionExplorerProvider";

export class AddExistingProjectCommand extends SingleItemActionsCommand {
    constructor(private readonly provider: SolutionExplorerProvider) {
        super('Add existing project');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return !item || (item && !!item.path && (item.contextValue === ContextValues.solution || item.contextValue === ContextValues.solution + '-cps'));
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
        if (!item) { return []; }

        const solution = await dialogs.selectOption('Select solution', this.getSolutions(item));
        const projectPath = await dialogs.openProjectFile('Select a project file to add');
        if (!solution || !projectPath) {
            return [];
        }

        return [ new DotNetAddExistingProject(solution, projectPath) ];
    }

    private getSolutions(item: TreeItem): dialogs.ItemsOrItemsResolver {
        if (item && item.path) {
            const result: { [id: string]: string } = {};
            result[item.label] = item.path;
            return result;
        }

        return async () => {
            const result: { [id: string]: string } = {};
            const children = await this.provider.getChildren();
            if (!children) { return result; }

            children.forEach(child => {
                if (child && child.path) {
                    result[child.label] = child.path;
                }
            });

            return result;
        };
    }
}
