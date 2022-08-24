import * as path from "@extensions/path";
import * as dialogs from "@extensions/dialogs";
import { ContextValues, TreeItem } from "@tree";
import { SolutionProjectType, ProjectInSolution, SolutionFile } from "@core/Solutions";
import { Action, MoveProject, MoveSolutionFolder } from "@actions";
import { ActionCommand } from "@commands/base";

export class MoveToSolutionFolderCommand extends ActionCommand {
    constructor() {
        super('Move to solution folder');
    }

    protected shouldRun(item: TreeItem): boolean {
        return !!item && !!item.solution &&  !!(<any>item).projectInSolution;
    }

    protected async getActions(item: TreeItem): Promise<Action[]> {
        const folder = await dialogs.selectOption('Select folder...', () => this.getFolders(item.solution));
        if (!folder) { return []; }

        const projectInSolution = (<any>item).projectInSolution;
        if (!projectInSolution) { return []; }

        if (item.contextValue.startsWith(ContextValues.project)) {
            return [ new MoveProject(item.solution, projectInSolution, folder) ];
        }

        if (item.contextValue.startsWith(ContextValues.solutionFolder)) {
            return [ new MoveSolutionFolder(item.solution, projectInSolution, folder) ];
        }

        return [];
    }

    private getFolders(solution: SolutionFile): Promise<{[id:string]: string}> {
        let folders: { id: string, name: string }[] = [];
        solution.projects.forEach(p => {
            if (p.projectType === SolutionProjectType.solutionFolder) {
                folders.push( { id: p.projectGuid, name: this.getFolderName(p, solution) });
            }
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

    private getFolderName(p: ProjectInSolution, solution: SolutionFile): string {
        if (!p.parentProjectGuid) { return  path.sep + p.projectName; }

        let parent = solution.projectsById[p.parentProjectGuid];
        return this.getFolderName(parent, solution) + path.sep + p.projectName;
    }
}