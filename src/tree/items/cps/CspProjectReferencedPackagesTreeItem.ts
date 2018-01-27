import { ProjectReferencedPackagesTreeItem } from "../ProjectReferencedPackagesTreeItem";
import { TreeItemContext } from "../../TreeItemContext";
import { PackageReference, Project } from "../../../model/Projects";
import { CspProjectReferencedPackageTreeItem } from "./CspProjectReferencedPackageTreeItem";

export class CspProjectReferencedPackagesTreeItem extends ProjectReferencedPackagesTreeItem {
    constructor(context: TreeItemContext, project: Project) {
        super(context, project, 'cps')
    }
    protected createReferencePackageItem(childContext: TreeItemContext, ref: PackageReference) {
        return new CspProjectReferencedPackageTreeItem(childContext, ref);
    }
}