import * as path from "@extensions/path";
import { getItemNesting } from "@extensions/config";
import { ProjectInSolution, SolutionProjectType, SolutionFile } from "@core/Solutions";
import { Project, ProjectFactory, ProjectItemEntry } from "@core/Projects";
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
import { SolutionFileTreeItem } from "@tree/items/SolutionFileTreeItem";

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
        const treeItem = await SolutionFolderTreeItem.create(context, project);
        await treeItem.getChildren();
        return treeItem;
    }

    const p = await ProjectFactory.parse(project);
    const projectContext = context.copy(p);
    if (p) {
        if (p.type === 'cps') { return new CpsProjectTreeItem(projectContext, project); }
        if (p.type === 'standard') { return new StandardProjectTreeItem(projectContext, project); }
        return new ProjectTreeItem(projectContext, project);
    }

    return new UnknownProjectTreeItem(projectContext, project);
}

export async function createItemsFromProject(context: TreeItemContext, project: Project, virtualPath?: string): Promise<TreeItem[]> {
    if (!virtualPath) { virtualPath = "."; }

    const result: TreeItem[] = [];
    
    const unFilteredItems = await project.getProjectItemEntries();
    let items: ProjectItemEntry[] = []
    unFilteredItems.forEach(x => {
        if (items.findIndex(y => y.fullPath == x.fullPath) == -1)
            items.push(x);
    });

    const folders = items.filter(i => i.isDirectory && path.dirname(i.relativePath) === virtualPath);
    const files = items.filter(i => !i.isDirectory && path.dirname(i.relativePath) === virtualPath && !i.dependentUpon);


    if (!project.fullPath.endsWith('.fsproj')) {
        const head = ['properties','wwwroot']
        folders.sort((a, b) => {
            const x : string = a.name.toLowerCase();
            const y : string = b.name.toLowerCase();
            const hx = head.indexOf(x);
            const hy = head.indexOf(y);
            if (hx >= 0 && hy >= 0) {
                return hx - hy;
            } else if (hx >= 0) {
                return -1;
            } else if (hy >= 0) {
                return 1;
            } else {
                return  x < y ? -1 : x > y ? 1 : 0;
            }
        });

        files.sort((a, b) => {
            const x : string = a.name.toLowerCase();
            const y : string = b.name.toLowerCase();
            return  x < y ? -1 : x > y ? 1 : 0;
        });
    }

    folders.forEach(folder => {
        result.push(new ProjectFolderTreeItem(context, folder));
    });

    const useNesting = getItemNesting();
    const allRelatedFiles: ProjectItemEntry[] = [];
    files.forEach(file => {
        const related: ProjectItemEntry[] = getDependants(items, path.dirname(project.fullPath), file.fullPath);
        if (useNesting) {
            related.push(...getNestedFiles(files, file.relativePath));
        }

        if (related.length > 0) {
            related.forEach(r => {
                const iIndex = items.findIndex(i => i.fullPath === r.fullPath);
                if (iIndex >= 0) {
                    items.splice(iIndex, 1);
                }
                const rIndex = result.findIndex(i => i.path === r.fullPath);
                if (rIndex >= 0) {
                    result.splice(rIndex, 1);
                }
            });
            allRelatedFiles.push(...related);
        }

        if (allRelatedFiles.find(i => i.fullPath === file.fullPath)) {
            return;
        }

        if (result.find(i => i.path === file.fullPath)) {
            return;
        }

        result.push(new ProjectFileTreeItem(context, file, related));
    });

    return result;
}

function getNestedFiles(files: ProjectItemEntry[], relativeFilePath: string): ProjectItemEntry[] {
    const filename = path.basename(relativeFilePath);
    const extension = path.extname(filename);
    const name = path.basename(filename, extension) + ".";
    return files.filter(f => f.name !== filename && f.name.startsWith(name) && f.name.endsWith(extension));
}

function getDependants(files: ProjectItemEntry[], projectFolderPath: string, fullFilePath: string): ProjectItemEntry[] {
    return files.filter(f => f.dependentUpon && path.join(projectFolderPath, f.dependentUpon) === fullFilePath);
}