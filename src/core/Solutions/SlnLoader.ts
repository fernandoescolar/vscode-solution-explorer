import * as path from "path";
import { Solution, SolutionItem, SolutionFolder, SolutionProject, SolutionProjectType, SolutionType } from ".";
import {
    SolutionFile as Sln,
    SolutionProjectType as SlnProjectType,
    ProjectInSolution as SlnProjectInSolution,
    ProjectTypeIds as SlnProjectTypeIds,
} from "./sln";

export class SlnLoader {
    static async load(filepath: string): Promise<Solution> {
        const sln = await Sln.parse(filepath);
        const solution = new Solution();
        solution.type = SolutionType.Sln;
        solution.fullPath = filepath;
        solution.folderPath = path.dirname(filepath);
        solution.name = path.basename(filepath, path.extname(filepath));
        sln.projects.filter(x => !x.parentProjectGuid).forEach(project => {
            const i = this.createSolutionItem(sln, project);
            solution.addItem(i);
        });

        return solution;
    }

    private static createSolutionItem(sln: Sln, project: SlnProjectInSolution): SolutionItem {
        if (project.projectType === SlnProjectType.solutionFolder) {
            const folder = new SolutionFolder(project.projectGuid);
            folder.name = project.projectName;
            folder.fullPath = project.fullPath;
            folder.solutionFiles = project.solutionItems;
            sln.projects.filter(x => x.parentProjectGuid === project.projectGuid).forEach(x => {
                const i = this.createSolutionItem(sln, x);
                folder.addItem(i);
            });

            return folder;
        }

        const p = new SolutionProject(project.projectGuid);
        p.name = project.projectName;
        p.fullPath = project.fullPath;
        if (p.fullPath.toLocaleLowerCase().endsWith(".njsproj")) {
            p.type = SolutionProjectType.noReferences;
        } else if (p.fullPath.toLocaleLowerCase().endsWith(".shproj")) {
            p.type = SolutionProjectType.shared;
        } else if (project.projectType === SlnProjectType.knownToBeMSBuildFormat) {
            p.type = SolutionProjectType.default;
        } else if (project.projectType === SlnProjectType.webProject) {
            p.type = SolutionProjectType.default;
        } else if (project.projectTypeId === SlnProjectTypeIds.shProjectGuid) {
            p.type = SolutionProjectType.shared;
        } else if (project.projectTypeId === SlnProjectTypeIds.deployProjectGuid) {
            p.type = SolutionProjectType.noReferences;
        } else {
            p.type = SolutionProjectType.default;
        }

        return p;
    }
}
