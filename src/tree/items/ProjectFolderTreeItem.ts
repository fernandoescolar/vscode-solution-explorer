import * as path from "path";
import { TreeItem, TreeItemCollapsibleState } from "../";
import { TreeItemContext } from "../TreeItemContext";
import { ContextValues } from "../ContextValues";
import { ProjectInSolution } from "../../model/Solutions";
import { Project } from "../../model/Projects";
import { ProjectReferencedProjectTreeItem } from "./ProjectReferencedProjectTreeItem";
import { ProjectFolder } from "../../model/Projects/ProjectFolder";
import * as TreeItemFactory from "../TreeItemFactory";

export class ProjectFolderTreeItem extends TreeItem {
    constructor(context: TreeItemContext, private readonly projectFolder: ProjectFolder) {
        super(context, projectFolder.name, TreeItemCollapsibleState.Collapsed, ContextValues.ProjectFolder, projectFolder.fullPath);
    }

    protected async createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {
        let virtualPath = this.projectFolder.fullPath.replace(path.dirname(this.project.fullPath), '');
        if (virtualPath.startsWith(path.sep))
            virtualPath = virtualPath.substring(1);
        
        let result: TreeItem[] = [];
        let items = await TreeItemFactory.CreateItemsFromProject(childContext, this.project, virtualPath);
        items.forEach(item => result.push(item));
        
        return result;
    }
}