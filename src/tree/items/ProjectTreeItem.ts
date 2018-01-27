import { TreeItem, TreeItemCollapsibleState, IFileCreator, IFolderCreator } from "../";
import { TreeItemContext } from "../TreeItemContext";
import { ContextValues } from "../ContextValues";
import { ProjectInSolution } from "../../model/Solutions";
import { Project } from "../../model/Projects";
import { ProjectReferencesTreeItem } from "./ProjectReferencesTreeItem";
import * as TreeItemFactory from "../TreeItemFactory";
import * as path from 'path';
import { resolve } from "url";

export class ProjectTreeItem extends TreeItem implements IFileCreator, IFolderCreator {
    constructor(context: TreeItemContext, protected readonly project: Project, protected readonly projectInSolution: ProjectInSolution) {
        super(context, projectInSolution.projectName, TreeItemCollapsibleState.Collapsed, ContextValues.Project, projectInSolution.fullPath);
    }
    
    public async createFile(name: string): Promise<string> {
        let filepath = path.dirname(this.project.fullPath);
        return await this.project.createFile(filepath, name);
    }

    public async createFolder(name: string): Promise<void> {
        let folderPath = path.join(path.dirname(this.project.fullPath), name);
        await this.project.createFolder(folderPath);
    }

    protected async createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {  
        let result: TreeItem[] = [];
        if (this.project.hasReferences) {
            let references = await this.createReferenceItems(childContext);
            references.forEach(i => result.push(i));
        }

        let items = await TreeItemFactory.CreateItemsFromProject(childContext, this.project);
        items.forEach(item => result.push(item));
        
        return result;
    }

    protected createReferenceItems(childContext: TreeItemContext): Promise<TreeItem[]> {
        return Promise.resolve([ new ProjectReferencesTreeItem(childContext, this.project) ]);
    }
}