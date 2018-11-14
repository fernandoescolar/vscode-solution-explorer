import * as path from "path";
import { CliCommandBase } from "./base/CliCommandBase";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem } from "../tree";
import { StaticCommandParameter } from "./parameters/StaticCommandParameter";
import { InputOptionsCommandParameter } from "./parameters/InputOptionsCommandParameter";
import { SolutionProjectType, ProjectInSolution } from "../model/Solutions";

export class AddProjectReferenceCommand extends CliCommandBase {
    constructor(provider: SolutionExplorerProvider) {
        super('Add project reference', provider, 'dotnet');
    }

    protected shouldRun(item: TreeItem): boolean {
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
        item.solution.Projects.forEach(p => {
            if (item.project && item.project.fullPath === p.fullPath) return false;
            if (p.projectType != SolutionProjectType.SolutionFolder) {
                result[this.getProjectName(p, item.solution.Projects)] = p.fullPath;
            }
        });

        return Promise.resolve(result);
    }

    private getProjectName(project: ProjectInSolution, projects: ProjectInSolution[]): any {
        if (!project.parentProjectGuid) return project.projectName;
       
        let index = projects.findIndex(p => p.projectGuid == project.parentProjectGuid);
        if (index <= 0) return project.projectName;
        return this.getProjectName(projects[index], projects) + path.sep + project.projectName;
    }
}