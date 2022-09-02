import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import { ProjectInSolution, SolutionProjectType, ProjectTypeIds } from "../Solutions";
import { MsBuildProject } from "./MsBuildProject";
import { Project } from "./Project";

const projectFileExtensions: { [id: string]: string } = {
    [".csproj"]: ".cs",
    [".fsproj"]: ".fs",
    [".vbproj"]: ".vb",
    [".vcxproj"]: ".cpp",
    [".njsproj"]: ".js"
};

export class ProjectFactory {
    public static async parse(project: string | ProjectInSolution): Promise<Project | undefined> {
        const fullPath: string = typeof project === "string" ? project : project.fullPath;
        if (!(await fs.exists(fullPath))) {
            return undefined;
        }

        let result = ProjectFactory.loadNodejsProject(fullPath);
        if (!result && typeof project !== "string") {
            result = ProjectFactory.loadProjectByType(project);
        }
        if (!result) {
            result = ProjectFactory.loadProjectByExtension(fullPath);
        }

        ProjectFactory.getFileDefaultExtension(result);

        if (result) {
            try {
            await result.refresh();
            } catch (e) {
                console.log(e);
            }
        }

        return result;
    }

    private static getFileDefaultExtension(project: Project | undefined) {
        if (!project) { return; }

        const extension = path.extname(project.fullPath);
        const fileExtension = projectFileExtensions[extension];
        if (project && fileExtension) {
            project.fileExtension = fileExtension;
        }
    }

    private static loadNodejsProject(fullPath: string): Project | undefined {
        if (fullPath.toLocaleLowerCase().endsWith(".njsproj")) {
            return ProjectFactory.loadNoReferencesProject(fullPath);
        }
    }

    private static loadProjectByType(project: ProjectInSolution): Project | undefined {
        if (project.projectType === SolutionProjectType.knownToBeMSBuildFormat) {
            return ProjectFactory.loadDefaultProject(project.fullPath);
        }

        if (project.projectType === SolutionProjectType.webProject) {
            return ProjectFactory.loadDefaultProject(project.fullPath);
        }

        if (project.projectTypeId === ProjectTypeIds.shProjectGuid) {
            return ProjectFactory.loadSharedProject(project.fullPath);
        }

        if (project.projectTypeId === ProjectTypeIds.deployProjectGuid) {
            return ProjectFactory.loadNoReferencesProject(project.fullPath);
        }
    }

    private static loadProjectByExtension(fullPath: string): Project | undefined {
        const extension = path.extname(fullPath);
        if (extension === ".shproj") {
            return ProjectFactory.loadSharedProject(fullPath);
        } else if (extension === ".a") {

        } else {
            return ProjectFactory.loadDefaultProject(fullPath);
        }
    }

    private static loadDefaultProject(fullPath: string): Project {
        return new MsBuildProject(fullPath);
    }

    private static loadNoReferencesProject(fullPath: string): Project {
        return new MsBuildProject(fullPath, false);
    }

    private static loadSharedProject(fullPath: string): Project {
        return new MsBuildProject(fullPath.replace(".shproj", ".projitems"), false, "$(MSBuildThisFileDirectory)");
    }
}
