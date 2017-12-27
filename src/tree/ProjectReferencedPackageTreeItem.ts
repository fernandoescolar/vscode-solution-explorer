import { TreeItem, TreeItemCollapsibleState } from "./TreeItem";
import { ContextValues } from "./ContextValues";
import { PackageReference } from "../model/Projects";


export class ProjectReferencedPackageTreeItem extends TreeItem {
    constructor(pkgRef: PackageReference, parent: TreeItem) {
        super(pkgRef.Name + ' (' + pkgRef.Version + ')', TreeItemCollapsibleState.None, ContextValues.ProjectReferencedPackages, parent);
    }

    public getChildren(): Thenable<TreeItem[]> {
        return Promise.resolve(null);
    }
}