import { TreeItem, TreeItemCollapsibleState } from "../";
import { TreeItemContext } from "../TreeItemContext";
import { ContextValues } from "../ContextValues";
import { Project } from "../../model/Projects";
import { ProjectReferencedPackageTreeItem } from "./ProjectReferencedPackageTreeItem";

export class ProjectReferencedPackagesTreeItem extends TreeItem {
    constructor(context: TreeItemContext, private readonly project: Project) {
        super(context, "packages", TreeItemCollapsibleState.Collapsed, ContextValues.ProjectReferencedPackages);
    }

    protected async createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {  
        var refs = await this.project.getPackageReferences();
        refs.sort((a, b) => {
            var x = a.name.toLowerCase();
            var y = b.name.toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
        });

        let result: TreeItem[] = [];
        refs.forEach(ref => {
            result.push(new ProjectReferencedPackageTreeItem(childContext, ref));
        });

        return result;
    }
}