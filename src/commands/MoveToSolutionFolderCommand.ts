import * as path from "@extensions/path";
import * as dialogs from "@extensions/dialogs";
import { ContextValues, TreeItem } from "@tree";
import { Solution, SolutionType } from "@core/Solutions";
import { Action, SlnMoveProject, SlnMoveSolutionFolder } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class MoveToSolutionFolderCommand extends SingleItemActionsCommand {
    constructor() {
        super('Move to solution folder');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return !!item && !!item.solution &&  !!item.solutionItem;
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
        if (!item || !item.solution) { return []; }

        const folder = await dialogs.selectOption('Select folder...', () => this.getFolders(item.solution));
        if (!folder) { return []; }

        const solutionItem = item.solutionItem;
        if (!solutionItem) { return []; }

        if (item.solution.type === SolutionType.Sln && ContextValues.matchAnyLanguage(ContextValues.project, item.contextValue)) {
            return [ new SlnMoveProject(item.solution, solutionItem, folder) ];
        }

        if (item.solution.type === SolutionType.Sln && ContextValues.matchAnyLanguage(ContextValues.solutionFolder, item.contextValue)) {
            return [ new SlnMoveSolutionFolder(item.solution, solutionItem, folder) ];
        }

        return [];
    }

    private getFolders(solution: Solution): Promise<{[id:string]: string}> {
        let folders: { id: string, name: string }[] = [];
        solution.getAllFolders().forEach(p => {
            folders.push( { id: p.id, name: p.getFullDisplayName() });
        });

        folders.sort((a, b) => {
            let x = a.name.toLowerCase();
            let y = b.name.toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
        });

        let result: {[id:string]: string} = {};
        result[path.sep] = 'root';
        folders.forEach(f => {
            result[f.name] = f.id;
        });

        return Promise.resolve(result);
    }
}