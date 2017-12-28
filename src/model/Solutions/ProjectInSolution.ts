/***********
 * TypeScript simplified version of: 
 * https://github.com/Microsoft/msbuild/blob/master/src/Build/Construction/Solution/ProjectInSolution.cs
 */

import { SolutionFile } from "./SolutionFile"
import { SolutionProjectType } from "./SolutionProjectType";
import { ProjectConfigurationInSolution } from "./ProjectConfigurationInSolution";

export class ProjectInSolution {
    constructor(public readonly Solution: SolutionFile) {
    }

    public ProjectTypeId: string;
    public ProjectType: SolutionProjectType;
    public ProjectName: string;
    public RelativePath: string;
    public FullPath: string;
    public ProjectGuid: string;
    public ParentProjectGuid: string;
    public Dependencies: string[] = [];
    public WebProperties: { [id: string] : string } = {};
    public Configuration: { [id: string] : ProjectConfigurationInSolution } = {};

    public AddDependency(parentGuid): void {
        this.Dependencies.push(parentGuid);
    }

    public AddWebProperty(name: string, value: string): void {
        this.WebProperties[name] = value;
    }

    public SetProjectConfiguration(name: string, configuration: ProjectConfigurationInSolution) {
        this.Configuration[name] = configuration;
    }
}