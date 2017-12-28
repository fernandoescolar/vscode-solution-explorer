import * as path from "path";
import { ProjectInSolution, SolutionProjectType, SolutionFile, ProjectTypeIds } from "../model/Solutions";
import { TreeItem } from "./TreeItem";
import { SolutionFolderTreeItem } from "./SolutionFolderTreeItem";
import { UnknownProjectTreeItem } from "./UnknownProjectTreeItem";
import { ProjectTreeItem } from "./ProjectTreeItem";
import { SolutionTreeItem } from "./SolutionTreeItem";
import { ProjectFolderTreeItem } from "./ProjectFolderTreeItem";
import { ProjectFileTreeItem } from "./ProjectFileTreeItem";
import { CpsProject } from "../model/Projects/CpsProject";
import { Project } from "../model/Projects";
import { WebProject } from "../model/Projects/WebProject";
import { OldProject } from "../model/Projects/OldProject";

export function CreateFromSolution(solution: SolutionFile): TreeItem {
    return new SolutionTreeItem(solution);
}

export function CreateFromProject(parent: TreeItem, project: ProjectInSolution): TreeItem {
    if (project.ProjectType == SolutionProjectType.SolutionFolder) {
        return new SolutionFolderTreeItem(project, parent);
    } else if (project.ProjectType == SolutionProjectType.KnownToBeMSBuildFormat) {
        if (project.ProjectTypeId == ProjectTypeIds.cpsCsProjectGuid
            || project.ProjectTypeId == ProjectTypeIds.cpsVbProjectGuid
            || project.ProjectTypeId == ProjectTypeIds.cpsProjectGuid) {
            let p = new CpsProject(project);
            return new ProjectTreeItem(p, project, parent);
        }
    } else if (project.ProjectType == SolutionProjectType.WebProject) {
        project.FullPath = project.FullPath + '.web-project';
        let p = new WebProject(project);
        return new ProjectTreeItem(p, project, parent);
    }

    let p = new OldProject(project);
    return new ProjectTreeItem(p, project, parent);
    //return new UnknownProjectTreeItem(project, parent);
}

export async function CreateItemsFromProject(parent: TreeItem, project: Project, virtualPath?: string): Promise<TreeItem[]> {
    let items = await project.getProjectFilesAndFolders(virtualPath);
    items.folders.sort((a, b) => {
        var x = a.Name.toLowerCase();
        var y = b.Name.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });

    items.files.sort((a, b) => {
        var x = a.Name.toLowerCase();
        var y = b.Name.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });

    let result: TreeItem[] = [];
    items.folders.forEach(folder => {
        result.push(new ProjectFolderTreeItem(folder, project, parent));
    });
    items.files.forEach(file => {
        result.push(new ProjectFileTreeItem(file, project, parent));
    });

    return result;
}