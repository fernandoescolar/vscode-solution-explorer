import * as path from "@extensions/path";
import { TreeItem } from "@tree";
import { SolutionProjectType, ProjectInSolution } from "@core/Solutions";
import { SingleItemActionsCommand } from "@commands";
import { Action, AddProjectReference } from "@actions";
import * as dialogs from '@extensions/dialogs';

export class AddProjectReferenceCommand extends SingleItemActionsCommand {

    constructor() {
        super('Add project reference');
    }

    public  shouldRun(item: TreeItem): boolean {
        return item && !!item.project && item.project.type === 'cps';
    }

    public async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.project) { return []; }

        const projectPath = await dialogs.selectOption('Select project...', () => this.getCPSProjects(item));
        if (!projectPath) { return []; }

        return [ new AddProjectReference(item.project.fullPath, projectPath) ];
    }

    private getCPSProjects(item: TreeItem): Promise<{[id: string]: string}> {
        let result: {[id: string]: string} = {};
        item.solution.projects.forEach(p => {
            if (item.project && item.project.fullPath === p.fullPath) { return false; }
            if (p.projectType !== SolutionProjectType.solutionFolder) {
                result[this.getProjectName(p, item.solution.projects)] = p.fullPath;
            }
        });

        return Promise.resolve(result);
    }

    private getProjectName(project: ProjectInSolution, projects: ProjectInSolution[]): string {
        if (!project.parentProjectGuid) { return project.projectName; }

        let index = projects.findIndex(p => p.projectGuid === project.parentProjectGuid);
        if (index <= 0) { return project.projectName; }
        return this.getProjectName(projects[index], projects) + path.sep + project.projectName;
    }
}
