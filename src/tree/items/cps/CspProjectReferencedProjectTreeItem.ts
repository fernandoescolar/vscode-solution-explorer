import { ProjectReferencedProjectTreeItem } from "../ProjectReferencedProjectTreeItem";
import { TreeItemContext } from "../../TreeItemContext";
import { ProjectReference } from "../../../model/Projects";

export class CspProjectReferencedProjectTreeItem extends ProjectReferencedProjectTreeItem {
    constructor(context: TreeItemContext, pkgRef: ProjectReference) {
        super(context, pkgRef, 'cps');
    }
}