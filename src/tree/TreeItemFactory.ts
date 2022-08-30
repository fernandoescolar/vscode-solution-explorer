import * as path from "@extensions/path";
import { getItemNesting } from "@extensions/config";
import { ProjectInSolution, SolutionProjectType, SolutionFile, ProjectTypeIds } from "@core/Solutions";
import { Project, ProjectFactory, ProjectFile } from "@core/Projects";
import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem } from "@tree/TreeItem";
import { TreeItemContext } from "@tree/TreeItemContext";
import { SolutionFolderTreeItem } from "@tree/items/SolutionFolderTreeItem";
import { UnknownProjectTreeItem } from "@tree/items/UnknownProjectTreeItem";
import { ProjectTreeItem } from "@tree/items/ProjectTreeItem";
import { SolutionTreeItem } from "@tree/items/SolutionTreeItem";
import { ProjectFolderTreeItem } from "@tree/items/ProjectFolderTreeItem";
import { ProjectFileTreeItem } from "@tree/items/ProjectFileTreeItem";
import { CpsProjectTreeItem } from "@tree/items/cps/CpsProjectTreeItem";
import { StandardProjectTreeItem } from "@tree/items/standard/StandardProjectTreeItem";
import { WebSiteProjectTreeItem } from "@tree/items/website/WebSiteProjectTreeItem";
import { SharedProjectTreeItem } from "@tree/items/standard/SharedProjectTreeItem";
import { DeployProjectTreeItem } from "@tree/items/standard/DeployProjectTreeItem";
import { SolutionFileTreeItem } from "@tree/items/SolutionFileTreeItem";

// export function CreateNoSolution(provider: SolutionExplorerProvider, rootPath: string): Promise<TreeItem> {
//     let context = new TreeItemContext(provider, undefined, rootPath);
//     return Promise.resolve(new NoSolutionTreeItem(context, rootPath));
// }

export async function createFromSolution(provider: SolutionExplorerProvider, solution: SolutionFile, workspaceRoot: string): Promise<TreeItem> {
    let context = new TreeItemContext(provider, solution, workspaceRoot);
    let treeItem = new SolutionTreeItem(context);
    await treeItem.getChildren();
    await treeItem.refreshContextValue();
    return treeItem;
}

export async function createItemsFromSolution(context: TreeItemContext, solution: SolutionFile, projectInSolution?: ProjectInSolution): Promise<TreeItem[]> {
    let result: TreeItem[] = [];
    let folders: ProjectInSolution[] = [];
    let projects: ProjectInSolution[] = [];
    solution.projects.forEach(project => {
        if (!projectInSolution && project.parentProjectGuid) { return false; }
        if (projectInSolution && project.parentProjectGuid !== projectInSolution.projectGuid) { return false; }
        if (project.projectType === SolutionProjectType.solutionFolder) {
            folders.push(project);
        } else {
            projects.push(project);
        }
    });

    folders.sort((a, b) => {
        let x = a.projectName.toLowerCase();
        let y = b.projectName.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });

    projects.sort((a, b) => {
        let x = a.projectName.toLowerCase();
        let y = b.projectName.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });

    for(let i = 0; i < folders.length; i++) {
        result.push(await createFromProject(context, folders[i]));
    }

    for(let i = 0; i < projects.length; i++) {
        result.push(await createFromProject(context, projects[i]));
    }

    if (projectInSolution) {
        Object.keys(projectInSolution.solutionItems).forEach(k => {
            const fullpath = path.join(solution.folderPath, projectInSolution.solutionItems[k]);
            result.push(new SolutionFileTreeItem(context, k, fullpath, projectInSolution));
        });
    }

    return result;
}

async function createFromProject(context: TreeItemContext, project: ProjectInSolution): Promise<TreeItem> {
    if (project.projectType === SolutionProjectType.solutionFolder) {
        let treeItem = await SolutionFolderTreeItem.create(context, project);
        await treeItem.getChildren();
        return treeItem;
    }

    let p = await ProjectFactory.parse(project);
    let projectContext = context.copy(p ?? undefined);
    if (p) {
        if (p.type === 'cps') { return new CpsProjectTreeItem(projectContext, project); }
        if (p.type === 'standard') { return new StandardProjectTreeItem(projectContext, project); }
        if (p.type === 'shared') { return new SharedProjectTreeItem(projectContext, project); }
        if (p.type === 'website') { return new WebSiteProjectTreeItem(projectContext, project); }
        if (p.type === 'deploy') { return new DeployProjectTreeItem(projectContext, project); }
        return new ProjectTreeItem(projectContext, project);
    }

    return new UnknownProjectTreeItem(projectContext, project);
}

export async function createItemsFromProject(context: TreeItemContext, project: Project, virtualPath?: string): Promise<TreeItem[]> {
    let result: TreeItem[] = [];

    let items = await project.getProjectFilesAndFolders(virtualPath);
    const head = ['properties','wwwroot']
    items.folders.sort((a, b) => {
        let x : string = a.name.toLowerCase();
        let y : string = b.name.toLowerCase();

        if (head.includes(x)) {
            return -1
        } else if (head.includes(y)) {
            return 1
        } else {
            return  x < y ? -1 : x > y ? 1 : 0;
        }
    })
    items.folders.forEach(folder => {
        result.push(new ProjectFolderTreeItem(context, folder));
    });

    const useNesting = getItemNesting();
    if (useNesting) {
        let threePointFiles : ProjectFile[] = items.files.filter(f => f.name.split('.').length > 2);
        let handledthreePointFiles: ProjectFile[] = [];
        items.files.forEach(file => {
            if (threePointFiles.indexOf(file) >= 0) { return; }
            if (threePointFiles.length > 0) {
                const name = file.name.split('.')[0];
                const extension = path.extname(file.name).substring(1);
                const related = threePointFiles.filter(f => f.name.startsWith(name) && f.name.endsWith(extension) && handledthreePointFiles.indexOf(f) < 0);
                handledthreePointFiles.push(...related);
                result.push(new ProjectFileTreeItem(context, file, related));
            } else {
                result.push(new ProjectFileTreeItem(context, file));
            }
        });
        threePointFiles.filter(f => handledthreePointFiles.indexOf(f) < 0).forEach(file => {
            result.push(new ProjectFileTreeItem(context, file));
        });
    } else {
        items.files.forEach(file => {
            result.push(new ProjectFileTreeItem(context, file));
        });
    }

    Object.keys(project.solutionItems).forEach(k => {
        const fullpath = path.join(context.solution.folderPath, project.solutionItems[k]);
        result.push(new SolutionFileTreeItem(context, k, fullpath, project.projectInSolution));
    });

    return result;
}