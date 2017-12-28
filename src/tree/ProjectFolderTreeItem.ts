import * as path from "path";
import { TreeItem, TreeItemCollapsibleState } from "./TreeItem";
import { ContextValues } from "./ContextValues";
import { ProjectInSolution } from "../model/Solutions";
import { Project } from "../model/Projects";
import { ProjectReferencedProjectTreeItem } from "./ProjectReferencedProjectTreeItem";
import * as TreeItemFactory from "./TreeItemFactory";

export class ProjectFolderTreeItem extends TreeItem {
    private children: TreeItem[] = null;

    constructor(name: string, path:string, private readonly project: Project, parent: TreeItem) {
        super(name, TreeItemCollapsibleState.Collapsed, ContextValues.ProjectFolder, parent, path);
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

        let items = await TreeItemFactory.CreateItemsFromProject(this, this.project, this.path);
        items.forEach(item => this.children.push(item));
        
        return this.children;
    }
}