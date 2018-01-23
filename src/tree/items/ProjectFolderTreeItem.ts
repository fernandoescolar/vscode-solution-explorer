import * as path from "path";
import { TreeItem, TreeItemCollapsibleState, IFileCreator, IFolderCreator, IDeletable, IRenameable } from "../";
import { TreeItemContext } from "../TreeItemContext";
import { ContextValues } from "../ContextValues";
import { ProjectInSolution } from "../../model/Solutions";
import { Project } from "../../model/Projects";
import { ProjectReferencedProjectTreeItem } from "./ProjectReferencedProjectTreeItem";
import { ProjectFolder } from "../../model/Projects/ProjectFolder";
import * as TreeItemFactory from "../TreeItemFactory";

export class ProjectFolderTreeItem extends TreeItem implements IFileCreator, IFolderCreator, IDeletable, IRenameable {
    constructor(context: TreeItemContext, private readonly projectFolder: ProjectFolder, private readonly project: Project) {
        super(context, projectFolder.name, TreeItemCollapsibleState.Collapsed, ContextValues.ProjectFolder, projectFolder.fullPath);
    }
    
    public createFile(name: string): Promise<string> {
        return this.project.createFile(this.path, name);
    }

    public async rename(name: string): Promise<void> {
        await this.project.renameFolder(this.path, name);
    }

    public async delete(): Promise<void> {
        await this.project.deleteFolder(this.path);
    }

    public async createFolder(name: string): Promise<void> {
        let folderpath = path.join(this.path, name);
        await this.project.createFolder(folderpath);
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