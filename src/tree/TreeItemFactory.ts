import * as path from "path";
import { ProjectInSolution, SolutionProjectType, SolutionFile, ProjectTypeIds } from "../model/Solutions";
import { Project, ProjectFactory } from "../model/Projects";
import { TreeItem } from "./TreeItem";
import { TreeItemContext } from "./TreeItemContext";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { SolutionFolderTreeItem } from "./items/SolutionFolderTreeItem";
import { UnknownProjectTreeItem } from "./items/UnknownProjectTreeItem";
import { ProjectTreeItem } from "./items/ProjectTreeItem";
import { SolutionTreeItem } from "./items/SolutionTreeItem";
import { ProjectFolderTreeItem } from "./items/ProjectFolderTreeItem";
import { ProjectFileTreeItem } from "./items/ProjectFileTreeItem";
import { CpsProjectTreeItem } from "./items/cps/CpsProjectTreeItem";
import { StandardProjectTreeItem } from "./items/standard/StandardProjectTreeItem";
import { WebSiteProjectTreeItem } from "./items/website/WebSiteProjectTreeItem";

export function CreateFromSolution(provider: SolutionExplorerProvider, solution: SolutionFile): Promise<TreeItem> {
    let context = new TreeItemContext(provider, solution);
    return Promise.resolve(new SolutionTreeItem(context));
}

export async function CreateFromProject(context: TreeItemContext, project: ProjectInSolution): Promise<TreeItem> {
    if (project.projectType == SolutionProjectType.SolutionFolder) {
        return new SolutionFolderTreeItem(context, project);
    } 

    let p = await ProjectFactory.parse(project);
    let projectContext = context.copy(p);
    if (p) {
        if (p.type == 'cps') return new CpsProjectTreeItem(projectContext, project);
        if (p.type == 'standard') return new StandardProjectTreeItem(projectContext, project);
        if (p.type == 'website') return new WebSiteProjectTreeItem(projectContext, project);
        return new ProjectTreeItem(projectContext, project);
    }

    return new UnknownProjectTreeItem(projectContext, project);
}

export async function CreateItemsFromProject(context: TreeItemContext, project: Project, virtualPath?: string): Promise<TreeItem[]> {
    let items = await project.getProjectFilesAndFolders(virtualPath);
    let result: TreeItem[] = [];
    
    items.folders.forEach(folder => {
        result.push(new ProjectFolderTreeItem(context, folder));
    });
    items.files.forEach(file => {
        result.push(new ProjectFileTreeItem(context, file));
    });

    return result;
}