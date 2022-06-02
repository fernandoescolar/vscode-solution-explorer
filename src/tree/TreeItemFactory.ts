import * as path from "path";
import { ProjectInSolution, SolutionProjectType, SolutionFile, ProjectTypeIds } from "../model/Solutions";
import { Project, ProjectFactory, ProjectFile } from "../model/Projects";
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
import { NoSolutionTreeItem } from "./items/NoSolutionTreeItem";
import { SharedProjectTreeItem } from "./items/standard/SharedProjectTreeItem";
import { DeployProjectTreeItem } from "./items/standard/DeployProjectTreeItem";
import { SolutionFileTreeItem } from "./items/SolutionFileTreeItem";

export function CreateNoSolution(provider: SolutionExplorerProvider, rootPath: string): Promise<TreeItem> {
    let context = new TreeItemContext(provider, null, rootPath);
    return Promise.resolve(new NoSolutionTreeItem(context, rootPath));
}

export async function CreateFromSolution(provider: SolutionExplorerProvider, solution: SolutionFile, workspaceRoot: string): Promise<TreeItem> {
    let context = new TreeItemContext(provider, solution, workspaceRoot);
    let treeItem = new SolutionTreeItem(context);
    await treeItem.getChildren();
    await treeItem.refreshContextValue();
    return treeItem;
}

export async function CreateItemsFromSolution(context: TreeItemContext, solution: SolutionFile, projectInSolution?: ProjectInSolution): Promise<TreeItem[]> {
    let result: TreeItem[] = [];
    let folders: ProjectInSolution[] = [];
    let projects: ProjectInSolution[] = [];
    solution.Projects.forEach(project => {
        if (!projectInSolution && project.parentProjectGuid) return false;
        if (projectInSolution && project.parentProjectGuid != projectInSolution.projectGuid) return false;
        if (project.projectType == SolutionProjectType.SolutionFolder)
            folders.push(project);
        else
            projects.push(project);
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
        result.push(await CreateFromProject(context, folders[i]));
    }

    for(let i = 0; i < projects.length; i++) {
        result.push(await CreateFromProject(context, projects[i]));
    }

    if (projectInSolution) {
        Object.keys(projectInSolution.solutionItems).forEach(k => {
            const fullpath = path.join(solution.FolderPath, projectInSolution.solutionItems[k]);
            result.push(new SolutionFileTreeItem(context, k, fullpath));
        });
    }

    return result;
}

async function CreateFromProject(context: TreeItemContext, project: ProjectInSolution): Promise<TreeItem> {
    if (project.projectType == SolutionProjectType.SolutionFolder) {
        let treeItem = new SolutionFolderTreeItem(context, project);
        await treeItem.getChildren();
        return treeItem;
    }

    let p = await ProjectFactory.parse(project);
    let projectContext = context.copy(p);
    if (p) {
        if (p.type == 'cps') return new CpsProjectTreeItem(projectContext, project);
        if (p.type == 'standard') return new StandardProjectTreeItem(projectContext, project);
        if (p.type == 'shared') return new SharedProjectTreeItem(projectContext, project);
        if (p.type == 'website') return new WebSiteProjectTreeItem(projectContext, project);
        if (p.type == 'deploy') return new DeployProjectTreeItem(projectContext, project);
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

    var csharpFiles : ProjectFile[] = items.files.filter(r => r.name.endsWith(".cs"));
    var partialClassesAreThere : boolean = csharpFiles.map(l => l.name)
        .map(l => l.split("."))
        .filter(r => r.length > 2).length > 0;
    

    if(partialClassesAreThere) {
        let handledPartialClasses : string[] = [];
        csharpFiles.forEach(cs => {
            let hasPartialIdentifier : boolean = cs.name.split(".").length > 2;
            if(hasPartialIdentifier) {
                let className = cs.name.split(".")[0];

                let mainFile = csharpFiles.filter(r => r.name == className + ".cs");

                if(mainFile.length > 0) {

                    if(handledPartialClasses.indexOf(mainFile[0].fullPath) === -1) {
                        handledPartialClasses.push(mainFile[0].fullPath);
    
                        let relatedFiles = csharpFiles.filter(r => {
                            if(r.name.split(".").length === 2) { return false; }
                            let otherClassName = r.name.split(".")[0];
                            return className == otherClassName;
                        });
    
                        result.push(new ProjectFileTreeItem(context, mainFile[0], relatedFiles));
                    }

                } else {
                    result.push(new ProjectFileTreeItem(context, cs));
                }
            } else if(handledPartialClasses.indexOf(cs.fullPath) === -1) {
                result.push(new ProjectFileTreeItem(context, cs));
            }
        });
    }

    items.files.forEach(file => {
        if(!file.name.endsWith(".cs")) {
            result.push(new ProjectFileTreeItem(context, file));
        }
    });


    Object.keys(project.solutionItems).forEach(k => {
        const fullpath = path.join(context.solution.FolderPath, project.solutionItems[k]);
        result.push(new SolutionFileTreeItem(context, k, fullpath));
    });

    return result;
}