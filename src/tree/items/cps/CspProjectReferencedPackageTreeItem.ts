import { ProjectReferencedPackageTreeItem } from "../ProjectReferencedPackageTreeItem";
import { TreeItemContext } from "../../TreeItemContext";
import { PackageReference } from "../../../model/Projects";

export class CspProjectReferencedPackageTreeItem extends ProjectReferencedPackageTreeItem {
    constructor(context: TreeItemContext, pkgRef: PackageReference) {
        super(context, pkgRef, 'cps');
    }
}