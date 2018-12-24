/***********
 * TypeScript simplified version of: 
 * https://github.com/Microsoft/msbuild/blob/master/src/Build/Construction/Solution/ProjectInSolution.cs
 */

import { SolutionFile } from "./SolutionFile"
import { SolutionProjectType } from "./SolutionProjectType";
import { ProjectConfigurationInSolution } from "./ProjectConfigurationInSolution";

export class ProjectInSolution {
    constructor(public readonly solution: SolutionFile) {
    }

    public projectTypeId: string;
    public projectType: SolutionProjectType;
    public projectName: string;
    public relativePath: string;
    public fullPath: string;
    public projectGuid: string;
    public parentProjectGuid: string;
    public dependencies: string[] = [];
    public webProperties: { [id: string] : string } = {};
    public configuration: { [id: string] : ProjectConfigurationInSolution } = {};
    public solutionItems: { [id: string] : string } = {};

    public addDependency(parentGuid): void {
        this.dependencies.push(parentGuid);
    }

    public addWebProperty(name: string, value: string): void {
        this.webProperties[name] = value;
    }

    public addFile(name: string, filepath: string): void {
        this.solutionItems[name] = filepath;
    }

    public setProjectConfiguration(name: string, configuration: ProjectConfigurationInSolution) {
        this.configuration[name] = configuration;
    }
}