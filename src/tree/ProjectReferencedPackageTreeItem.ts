import { TreeItem, TreeItemCollapsibleState } from "./TreeItem";
import { ContextValues } from "./ContextValues";
import { PackageReference } from "../model/Projects";


export class ProjectReferencedPackageTreeItem extends TreeItem {
    constructor(pkgRef: PackageReference) {
        super(pkgRef.Name + ' (' + pkgRef.Version + ')', TreeItemCollapsibleState.None, ContextValues.ProjectReferencedPackages);
    }

    public getChildren(): Thenable<TreeItem[]> {
        return Promise.resolve(null);
    }
}