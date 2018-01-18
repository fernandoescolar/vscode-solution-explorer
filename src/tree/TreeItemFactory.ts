import * as path from "path";
import { ProjectInSolution, SolutionProjectType, SolutionFile, ProjectTypeIds } from "../model/Solutions";
import { Project, ProjectFactory } from "../model/Projects";
import { TreeItem } from "./TreeItem";
import { TreeItemContext } from "./TreeItemContext";
import { SolutionFolderTreeItem } from "./items/SolutionFolderTreeItem";
import { UnknownProjectTreeItem } from "./items/UnknownProjectTreeItem";
import { ProjectTreeItem } from "./items/ProjectTreeItem";
import { SolutionTreeItem } from "./items/SolutionTreeItem";
import { ProjectFolderTreeItem } from "./items/ProjectFolderTreeItem";
import { ProjectFileTreeItem } from "./items/ProjectFileTreeItem";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";

export function CreateFromSolution(provider: SolutionExplorerProvider, solution: SolutionFile): Promise<TreeItem> {
    let context = new TreeItemContext(provider);
    return Promise.resolve(new SolutionTreeItem(context, solution));
}

export async function CreateFromProject(context: TreeItemContext, project: ProjectInSolution): Promise<TreeItem> {
    if (project.projectType == SolutionProjectType.SolutionFolder) {
        return new SolutionFolderTreeItem(context, project);
    } 

    let p = await ProjectFactory.parse(project);
    if (p) {
        return new ProjectTreeItem(context, p, project);
    }

    return new UnknownProjectTreeItem(context, project);
}

export async function CreateItemsFromProject(context: TreeItemContext, project: Project, virtualPath?: string): Promise<TreeItem[]> {
    let items = await project.getProjectFilesAndFolders(virtualPath);
    let result: TreeItem[] = [];
    
    items.folders.forEach(folder => {
        result.push(new ProjectFolderTreeItem(context, folder, project));
    });
    items.files.forEach(file => {
        result.push(new ProjectFileTreeItem(context, file, project));
    });

    return result;
}