import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import { MsBuildProject } from "./MsBuildProject";
import { Project } from "./Project";
import { Solution, SolutionItem, SolutionParentObject, SolutionProject, SolutionProjectType } from "@core/Solutions";

const projectFileExtensions: { [id: string]: string } = {
    [".csproj"]: ".cs",
    [".fsproj"]: ".fs",
    [".vbproj"]: ".vb",
    [".vcxproj"]: ".cpp",
    [".njsproj"]: ".js"
};

export class ProjectFactory {
    public static async parse(project: SolutionItem): Promise<Project | undefined> {
        const p = project as SolutionProject;
        if (!p) {
            return undefined;
        }

        const fullPath = project.fullPath || "";
        if (!(await fs.exists(fullPath))) {
            return undefined;
        }
        const solutionFullPath = ProjectFactory.findSolutionFullPath(project);
        let result: Project | undefined;
        if (p.type === SolutionProjectType.default) {
            result = ProjectFactory.loadDefaultProject(fullPath, solutionFullPath);
        }
        if (p.type === SolutionProjectType.noReferences) {
            result = ProjectFactory.loadNoReferencesProject(fullPath, solutionFullPath);
        }
        if (p.type === SolutionProjectType.shared) {
            result = ProjectFactory.loadSharedProject(fullPath, solutionFullPath);
        }

        if (result) {
            ProjectFactory.getFileDefaultExtension(result);
            try {
                await result.preload();
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

    // walks up .parent until it finds the owning Solution, so project-level
    // MSBuild property overrides can fall back to a solution-level default
    private static findSolutionFullPath(item: SolutionItem): string | undefined {
        let current: SolutionItem | SolutionParentObject | undefined = item;
        while (current) {
            if (current instanceof Solution) {
                return current.fullPath;
            }
            current = current.parent;
        }
        return undefined;
    }

    private static loadDefaultProject(fullPath: string, solutionFullPath?: string): Project {
        return new MsBuildProject(fullPath, undefined, undefined, solutionFullPath);
    }

    private static loadNoReferencesProject(fullPath: string, solutionFullPath?: string): Project {
        return new MsBuildProject(fullPath, false, undefined, solutionFullPath);
    }

    private static loadSharedProject(fullPath: string, solutionFullPath?: string): Project {
        return new MsBuildProject(fullPath.replace(".shproj", ".projitems"), false, "$(MSBuildThisFileDirectory)", solutionFullPath);
    }
}
