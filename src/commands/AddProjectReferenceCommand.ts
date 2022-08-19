import * as path from "@extensions/path";
import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem } from "@tree";
import { SolutionProjectType, ProjectInSolution } from "@core/Solutions";
import { CliCommandBase } from "@commands/base";
import { StaticCommandParameter } from "@commands/parameters/StaticCommandParameter";
import { InputOptionsCommandParameter } from "@commands/parameters/InputOptionsCommandParameter";

export class AddProjectReferenceCommand extends CliCommandBase {
    constructor(provider: SolutionExplorerProvider) {
        super('Add project reference', provider, 'dotnet');
    }

    protected shouldRun(item: TreeItem): boolean {
        if (!item || !item.project) { return false; }

        this.parameters = [
            new StaticCommandParameter('add'),
            new StaticCommandParameter(item.project.fullPath),
            new StaticCommandParameter('reference'),
            new InputOptionsCommandParameter('Select project...', () => this.getCPSProjects(item))
        ];

        return true;
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

    private getProjectName(project: ProjectInSolution, projects: ProjectInSolution[]): any {
        if (!project.parentProjectGuid) { return project.projectName; }

        let index = projects.findIndex(p => p.projectGuid === project.parentProjectGuid);
        if (index <= 0) { return project.projectName; }
        return this.getProjectName(projects[index], projects) + path.sep + project.projectName;
    }
}
