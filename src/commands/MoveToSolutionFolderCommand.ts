import * as path from "@extensions/path";
import * as dialogs from "@extensions/dialogs";
import { ContextValues, TreeItem } from "@tree";
import { SolutionProjectType, ProjectInSolution, SolutionFile } from "@core/Solutions";
import { Action, MoveProject, MoveSolutionFolder } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class MoveToSolutionFolderCommand extends SingleItemActionsCommand {
    constructor() {
        super('Move to solution folder');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return !!item && !!item.solution &&  !!item.projectInSolution;
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
        if (!item || !item.solution) { return []; }

        const folder = await dialogs.selectOption('Select folder...', () => this.getFolders(item.solution));
        if (!folder) { return []; }

        const projectInSolution = item.projectInSolution;
        if (!projectInSolution) { return []; }

        if (ContextValues.matchAnyLanguage(ContextValues.project, item.contextValue)) {
            return [ new MoveProject(item.solution, projectInSolution, folder) ];
        }

        if (ContextValues.matchAnyLanguage(ContextValues.solutionFolder, item.contextValue)) {
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