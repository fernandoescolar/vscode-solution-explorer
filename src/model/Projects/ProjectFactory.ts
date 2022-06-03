import * as fs from "../../async/fs"
import * as xml from "../../async/xml";
import { ProjectInSolution, SolutionProjectType, ProjectTypeIds } from "../Solutions";
import { CpsProject } from "./Kinds/CpsProject";
import { StandardProject } from "./Kinds/StandardProject";
import { WebsiteProject } from "./Kinds/WebsiteProject";
import { Project } from "./Project";
import { SharedProject } from "./Kinds/SharedProject";
import { DeployProject } from "./Kinds/DeployProject";
import { NoReferencesStandardProject } from "./Kinds/NoReferencesStandardProject";

const cpsProjectTypes = [ ProjectTypeIds.cpsCsProjectGuid, ProjectTypeIds.cpsVbProjectGuid, ProjectTypeIds.cpsProjectGuid ];
const standardProjectTypes = [ ProjectTypeIds.csProjectGuid, ProjectTypeIds.fsProjectGuid, ProjectTypeIds.vbProjectGuid, ProjectTypeIds.vcProjectGuid, ProjectTypeIds.cpsFsProjectGuid ];
const projectFileExtensions = {
    [ProjectTypeIds.csProjectGuid]: ".cs",
    [ProjectTypeIds.fsProjectGuid]: ".fs",
    [ProjectTypeIds.vbProjectGuid]: ".vb",
    [ProjectTypeIds.vcProjectGuid]: ".cpp",
    [ProjectTypeIds.cpsCsProjectGuid]: ".cs",
    [ProjectTypeIds.cpsVbProjectGuid]: ".vb",
    [ProjectTypeIds.cpsFsProjectGuid]: ".fs",
};

export class ProjectFactory {
    public static async parse(project: ProjectInSolution): Promise<Project> {
        if (!(await fs.exists(project.fullPath))) {
            return null;
        }

        let result: Project = null;
        if (project.fullPath.toLocaleLowerCase().endsWith(".njsproj")) {
            result = await ProjectFactory.loadNoReferencesStandardProject(project);

        }
        if (project.projectType == SolutionProjectType.KnownToBeMSBuildFormat
            && cpsProjectTypes.indexOf(project.projectTypeId) >= 0) {
            result = await ProjectFactory.loadCpsProject(project);
        }

        if (project.projectType == SolutionProjectType.KnownToBeMSBuildFormat
            && standardProjectTypes.indexOf(project.projectTypeId) >= 0) {
            result = await ProjectFactory.determineStandardProject(project);
        }

        if (project.projectType == SolutionProjectType.WebProject) {
            result = await ProjectFactory.loadWebsiteProject(project);
        }

        if (project.projectTypeId == ProjectTypeIds.shProjectGuid) {
            result = await ProjectFactory.loadSharedProject(project);
        }

        if (project.projectTypeId == ProjectTypeIds.deployProjectGuid) {
            result = await ProjectFactory.loadDeploydProject(project);
        }

        const fileExtension = projectFileExtensions[project.projectTypeId];
        if (fileExtension) {
            result.fileExtension = fileExtension;
        }

        return result;
    }

    private static async determineStandardProject(project: ProjectInSolution): Promise<Project> {
        let document =  await ProjectFactory.loadProjectDocument(project.fullPath);
        let element: any = Project.getProjectElement(document);

        if (!element) {
            return null;
        }

        if (element.attributes.Sdk
            && element.attributes.Sdk.startsWith("Microsoft.NET.Sdk"))
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

    private static loadNoReferencesStandardProject(project: ProjectInSolution): Promise<any> {
        return Promise.resolve(new NoReferencesStandardProject(project));
    }

    private static loadWebsiteProject(project: ProjectInSolution): Promise<any> {
        project.fullPath = project.fullPath + '.web-project';
        return Promise.resolve(new WebsiteProject(project));
    }

    private static loadSharedProject(project: ProjectInSolution): Promise<any> {
        return Promise.resolve(new SharedProject(project));
    }

    private static loadDeploydProject(project: ProjectInSolution): Promise<any> {
        return Promise.resolve(new DeployProject(project));
    }
}
