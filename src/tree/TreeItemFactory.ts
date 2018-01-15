import * as path from "path";
import { ProjectInSolution, SolutionProjectType, SolutionFile, ProjectTypeIds } from "../model/Solutions";
import { Project, ProjectFactory } from "../model/Projects";
import { TreeItem } from "./TreeItem";
import { SolutionFolderTreeItem } from "./items/SolutionFolderTreeItem";
import { UnknownProjectTreeItem } from "./items/UnknownProjectTreeItem";
import { ProjectTreeItem } from "./items/ProjectTreeItem";
import { SolutionTreeItem } from "./items/SolutionTreeItem";
import { ProjectFolderTreeItem } from "./items/ProjectFolderTreeItem";
import { ProjectFileTreeItem } from "./items/ProjectFileTreeItem";

export function CreateFromSolution(solution: SolutionFile): Promise<TreeItem> {
    return Promise.resolve(new SolutionTreeItem(solution));
}

export async function CreateFromProject(parent: TreeItem, project: ProjectInSolution): Promise<TreeItem> {
    if (project.projectType == SolutionProjectType.SolutionFolder) {
        return new SolutionFolderTreeItem(project, parent);
    } 

    let p = await ProjectFactory.parse(project);
    if (p) {
        return new ProjectTreeItem(p, project, parent);
    }

    return new UnknownProjectTreeItem(project, parent);
}

export async function CreateItemsFromProject(parent: TreeItem, project: Project, virtualPath?: string): Promise<TreeItem[]> {
    let items = await project.getProjectFilesAndFolders(virtualPath);
    let result: TreeItem[] = [];
    
    items.folders.forEach(folder => {
        result.push(new ProjectFolderTreeItem(folder, project, parent));
    });
    items.files.forEach(file => {
        result.push(new ProjectFileTreeItem(file, project, parent));
    });

    return result;
}