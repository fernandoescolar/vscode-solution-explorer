import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import { MsBuildProject } from "./MsBuildProject";
import { Project } from "./Project";
import { SolutionItem, SolutionProject, SolutionProjectType } from "@core/Solutions";

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
        let result: Project | undefined;
        if (p.type === SolutionProjectType.default) {
            result = ProjectFactory.loadDefaultProject(fullPath);
        }
        if (p.type === SolutionProjectType.noReferences) {
            result = ProjectFactory.loadNoReferencesProject(fullPath);
        }
        if (p.type === SolutionProjectType.shared) {
            result = ProjectFactory.loadSharedProject(fullPath);
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

    private static loadDefaultProject(fullPath: string): Project {
        return new MsBuildProject(fullPath, undefined, undefined);
    }

    private static loadNoReferencesProject(fullPath: string): Project {
        return new MsBuildProject(fullPath, false, undefined);
    }

    private static loadSharedProject(fullPath: string): Project {
        return new MsBuildProject(fullPath.replace(".shproj", ".projitems"), false, "$(MSBuildThisFileDirectory)");
    }
}
