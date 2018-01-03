import * as fs from "../../async/fs"
import * as xml from "../../async/xml";
import { ProjectInSolution, SolutionProjectType, ProjectTypeIds } from "../Solutions";
import { CpsProject } from "./Kinds/CpsProject";
import { StandardProject } from "./Kinds/StandardProject";
import { WebsiteProject } from "./Kinds/WebsiteProject";
import { Project } from "./Project";

const cpsProjectTypes = [ ProjectTypeIds.cpsCsProjectGuid, ProjectTypeIds.cpsVbProjectGuid, ProjectTypeIds.cpsProjectGuid ];
const standardProjectTypes = [ ProjectTypeIds.csProjectGuid, ProjectTypeIds.fsProjectGuid, ProjectTypeIds.vbProjectGuid ];

export class ProjectFactory {
    public static Parse(project: ProjectInSolution): Promise<Project> {
        if (project.ProjectType == SolutionProjectType.KnownToBeMSBuildFormat 
            && cpsProjectTypes.indexOf(project.ProjectTypeId) >= 0) {
            return ProjectFactory.LoadCspProject(project);
        } 

        if (project.ProjectType == SolutionProjectType.KnownToBeMSBuildFormat 
            && standardProjectTypes.indexOf(project.ProjectTypeId) >= 0) {
            return ProjectFactory.DetermineStandardProject(project);
        }

        if (project.ProjectType == SolutionProjectType.WebProject) {
            return ProjectFactory.LoadWebsiteProject(project);
        }

        return Promise.resolve(null);
    }

    private static async DetermineStandardProject(project: ProjectInSolution): Promise<Project> {
        let document =  await ProjectFactory.LoadProjectDocument(project.FullPath);

        if (document.Project.$.Sdk 
            && document.Project.$.Sdk.startsWith("Microsoft.NET.Sdk"))
            return new CpsProject(project, document);

        return new StandardProject(project, document);
    }

    private static async LoadProjectDocument(projectFullPath: string): Promise<any> {
        let content = await fs.readFile(projectFullPath, 'utf8');
        return  await xml.ParseToJson(content);
    }

    private static async LoadCspProject(project: ProjectInSolution): Promise<any> {
        let document =  await ProjectFactory.LoadProjectDocument(project.FullPath);
        return new CpsProject(project, document);
    }

    private static LoadWebsiteProject(project: ProjectInSolution): Promise<any> {
        project.FullPath = project.FullPath + '.web-project';
        return Promise.resolve(new WebsiteProject(project));
    }
}