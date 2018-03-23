import * as fs from "../../async/fs"
import * as xml from "../../async/xml";
import { ProjectInSolution, SolutionProjectType, ProjectTypeIds } from "../Solutions";
import { CpsProject } from "./Kinds/CpsProject";
import { StandardProject } from "./Kinds/StandardProject";
import { WebsiteProject } from "./Kinds/WebsiteProject";
import { Project } from "./Project";
import { SharedProject } from "./Kinds/SharedProject";

const cpsProjectTypes = [ ProjectTypeIds.cpsCsProjectGuid, ProjectTypeIds.cpsVbProjectGuid, ProjectTypeIds.cpsProjectGuid ];
const standardProjectTypes = [ ProjectTypeIds.csProjectGuid, ProjectTypeIds.fsProjectGuid, ProjectTypeIds.vbProjectGuid ];

export class ProjectFactory {
    public static parse(project: ProjectInSolution): Promise<Project> {
        if (project.projectType == SolutionProjectType.KnownToBeMSBuildFormat 
            && cpsProjectTypes.indexOf(project.projectTypeId) >= 0) {
            return ProjectFactory.loadCpsProject(project);
        } 

        if (project.projectType == SolutionProjectType.KnownToBeMSBuildFormat 
            && standardProjectTypes.indexOf(project.projectTypeId) >= 0) {
            return ProjectFactory.determineStandardProject(project);
        }

        if (project.projectType == SolutionProjectType.WebProject) {
            return ProjectFactory.loadWebsiteProject(project);
        }

        if (project.projectTypeId == ProjectTypeIds.shProjectGuid) {
            return ProjectFactory.loadSharedProject(project);
        }

        return Promise.resolve(null);
    }

    private static async determineStandardProject(project: ProjectInSolution): Promise<Project> {
        let document =  await ProjectFactory.loadProjectDocument(project.fullPath);

        if (document.Project.$.Sdk 
            && document.Project.$.Sdk.startsWith("Microsoft.NET.Sdk"))
            return new CpsProject(project, document);

        return new StandardProject(project, document);
    }

    private static async loadProjectDocument(projectFullPath: string): Promise<any> {
        let content = await fs.readFile(projectFullPath, 'utf8');
        return  await xml.ParseToJson(content);
    }

    private static async loadCpsProject(project: ProjectInSolution): Promise<any> {
        let document =  await ProjectFactory.loadProjectDocument(project.fullPath);
        return new CpsProject(project, document);
    }

    private static loadWebsiteProject(project: ProjectInSolution): Promise<any> {
        project.fullPath = project.fullPath + '.web-project';
        return Promise.resolve(new WebsiteProject(project));
    }

    private static loadSharedProject(project: ProjectInSolution): Promise<any> {
        return Promise.resolve(new SharedProject(project));
    }
}