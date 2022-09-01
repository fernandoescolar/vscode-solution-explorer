import * as fs from "@extensions/fs";
import { ProjectInSolution, SolutionProjectType, ProjectTypeIds } from "../Solutions";
import { MsBuildProject } from "./MsBuildProject";
import { Project } from "./Project";

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
    public static async parse(project: ProjectInSolution): Promise<Project | undefined> {
        if (!(await fs.exists(project.fullPath))) {
            return undefined;
        }

        let result: Project | undefined = undefined;
        if (project.fullPath.toLocaleLowerCase().endsWith(".njsproj")) {
            result = ProjectFactory.loadNoReferencesStandardProject(project);

        }
        if (project.projectType === SolutionProjectType.knownToBeMSBuildFormat
            && cpsProjectTypes.indexOf(project.projectTypeId) >= 0) {
            result = ProjectFactory.loadCpsProject(project);
        }

        if (project.projectType === SolutionProjectType.knownToBeMSBuildFormat
            && standardProjectTypes.indexOf(project.projectTypeId) >= 0) {
            result = ProjectFactory.determineStandardProject(project);
        }

        if (project.projectType === SolutionProjectType.webProject) {
            result = ProjectFactory.loadWebsiteProject(project);
        }

        if (project.projectTypeId === ProjectTypeIds.shProjectGuid) {
            result = ProjectFactory.loadSharedProject(project);
        }

        if (project.projectTypeId === ProjectTypeIds.deployProjectGuid) {
            result = ProjectFactory.loadDeploydProject(project);
        }

        const fileExtension = projectFileExtensions[project.projectTypeId];
        if (result && fileExtension) {
            result.fileExtension = fileExtension;
        }

        if (result) {
            try {
            await result.refresh();
            } catch (e) {
                console.log(e);
            }
        }

        return result;
    }

    private static determineStandardProject(project: ProjectInSolution): Project {
        return new MsBuildProject(project.fullPath);
    }

    private static loadCpsProject(project: ProjectInSolution): Project {
        return new MsBuildProject(project.fullPath);
    }

    private static loadNoReferencesStandardProject(project: ProjectInSolution): Project {
        return new MsBuildProject(project.fullPath, false);
    }

    private static loadWebsiteProject(project: ProjectInSolution): Project {
        return new MsBuildProject(project.fullPath);
    }

    private static loadSharedProject(project: ProjectInSolution): Project {
        return new MsBuildProject(project.fullPath, false, "$(MSBuildThisFileDirectory)");
    }

    private static loadDeploydProject(project: ProjectInSolution): Project {
        return new MsBuildProject(project.fullPath, false);
    }
}
