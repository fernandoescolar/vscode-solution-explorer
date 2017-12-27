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

        this.children = [];

        TreeItemFactory.CreateItemsFromProject(this, this.project, this.path).forEach(item => this.children.push(item));
        
        return Promise.resolve(this.children);
    }


    public refresh(): void {
        this.children = null;
    }
    
    public createFile(name: string): string {
        return this.project.createFile(this.path, name);
    }

    public rename(name: string): void {
        this.project.renameFolder(this.path, name);
    }

    public delete(): void {
        this.project.deleteFolder(this.path);
    }

    public createFolder(name: string): void {
        let folderpath = path.join(this.path, name);
        this.project.createFolder(folderpath);
    }
}