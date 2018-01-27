import { TreeItem, TreeItemCollapsibleState } from "../TreeItem";
import { ContextValues } from "../ContextValues";
import { TreeItemContext } from "../TreeItemContext";
import { PackageReference } from "../../model/Projects";


export class ProjectReferencedPackageTreeItem extends TreeItem {
    constructor(context: TreeItemContext, pkgRef: PackageReference, contextValue?: string) {
        super(context, pkgRef.name + ' (' + pkgRef.version + ')', TreeItemCollapsibleState.None, ContextValues.ProjectReferencedPackage + (contextValue ? '-' + contextValue : ''), pkgRef.name);
    }
}