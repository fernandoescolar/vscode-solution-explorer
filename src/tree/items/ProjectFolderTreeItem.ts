import * as path from "path";
import { TreeItem, TreeItemCollapsibleState } from "../TreeItem";
import { ContextValues } from "../ContextValues";
import { ProjectInSolution } from "../../model/Solutions";
import { Project } from "../../model/Projects";
import { ProjectReferencedProjectTreeItem } from "./ProjectReferencedProjectTreeItem";
import * as TreeItemFactory from "../TreeItemFactory";
import { ProjectFolder } from "../../model/Projects/ProjectFolder";
import { IFileCreator, IFolderCreator, IDeletable, IRenameable, IRefreshable } from "../index";

export class ProjectFolderTreeItem extends TreeItem implements IFileCreator, IFolderCreator, IDeletable, IRenameable, IRefreshable {
    private children: TreeItem[] = null;

    constructor(private readonly projectFolder: ProjectFolder, private readonly project: Project, parent: TreeItem) {
        super(projectFolder.name, TreeItemCollapsibleState.Collapsed, ContextValues.ProjectFolder, parent, projectFolder.fullPath);
    }

    public getChildren(): Thenable<TreeItem[]> {
        if (this.children) {
            return Promise.resolve(this.children);
        }

        return this.createChildren();
    }


    public refresh(): void {
        this.children = null;
    }
    
    public createFile(name: string): Promise<string> {
        return this.project.createFile(this.path, name);
    }

    public rename(name: string): Promise<void> {
        return this.project.renameFolder(this.path, name);
    }

    public delete(): Promise<void> {
        return this.project.deleteFolder(this.path);
    }

    public createFolder(name: string): Promise<void> {
        let folderpath = path.join(this.path, name);
        return this.project.createFolder(folderpath);
    }

    private async createChildren(): Promise<TreeItem[]> {
        this.children = [];

        let virtualPath = this.projectFolder.fullPath.replace(path.dirname(this.project.fullPath), '');
        if (virtualPath.startsWith(path.sep))
            virtualPath = virtualPath.substring(1);
            
        let items = await TreeItemFactory.CreateItemsFromProject(this, this.project, virtualPath);
        items.forEach(item => this.children.push(item));
        
        return this.children;
    }
}