import { TreeItem, TreeItemCollapsibleState } from "./TreeItem";
import * as TreeItemFactory from './TreeItemFactory';
import { ContextValues } from './ContextValues';
import { ProjectInSolution } from '../model/Solutions';

export class SolutionFolderTreeItem extends TreeItem {
    private children: TreeItem[] = null;
    
    constructor(private readonly project: ProjectInSolution) {
        super(project.ProjectName, TreeItemCollapsibleState.Expanded, ContextValues.SolutionFolder);
    }

    public getChildren(): Thenable<TreeItem[]> {
        if (this.children != null) {
            return Promise.resolve(this.children);
        }

        this.children = [];
        this.project.Solution.Projects.forEach(p => {
            if (p.ParentProjectGuid == this.project.ProjectGuid) this.children.push(TreeItemFactory.CreateFromProject(p));
        });

        return Promise.resolve(this.children);
    }
}