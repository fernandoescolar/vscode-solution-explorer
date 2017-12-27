import * as path from "path";
import { ProjectInSolution, SolutionProjectType, SolutionFile, ProjectTypeIds } from '../model/Solutions'
import { TreeItem } from './TreeItem';
import { SolutionFolderTreeItem } from './SolutionFolderTreeItem';
import { UnknownProjectTreeItem } from './UnknownProjectTreeItem';
import { CsProjectTreeItem } from './CsProjectTreeItem';
import { SolutionTreeItem } from './SolutionTreeItem';
import { ProjectFolderTreeItem } from "./ProjectFolderTreeItem";
import { ProjectFileTreeItem } from "./ProjectFileTreeItem";
import { CpsProject } from '../model/Projects/CpsProject';
import { Project } from '../model/Projects';

export function CreateFromSolution(solution: SolutionFile): TreeItem {
    return new SolutionTreeItem(solution);
}

export function CreateFromProject(project: ProjectInSolution): TreeItem {
    if (project.ProjectType == SolutionProjectType.SolutionFolder) {
        return new SolutionFolderTreeItem(project);
    } else if (project.ProjectType == SolutionProjectType.KnownToBeMSBuildFormat) {
        if (project.ProjectTypeId == ProjectTypeIds.cpsCsProjectGuid){
            var p = new CpsProject(project);
            return new CsProjectTreeItem(p, project);
        }
    }

    return new UnknownProjectTreeItem(project);
}

export function CreateItemsFromProject(project: Project, virtualPath?: string): TreeItem[] {
    let items = project.getProjectFilesAndFolders(virtualPath);
    items.folders.sort((a, b) => {
        var x = a.toLowerCase();
        var y = b.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });

    items.files.sort((a, b) => {
        var x = a.toLowerCase();
        var y = b.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });

    let result: TreeItem[] = [];
    items.folders.forEach(folder => {
        let relativePath = virtualPath ? path.join(virtualPath, folder) : folder;
        result.push(new ProjectFolderTreeItem(folder, relativePath, project));
    });
    items.files.forEach(file => {
        let fullpath = virtualPath ? path.join(virtualPath, file) : file;
        fullpath = path.join(path.dirname(project.FullPath), fullpath);
        result.push(new ProjectFileTreeItem(file, fullpath, project));
    });

    return result;
}