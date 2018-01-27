import { ProjectReferencedProjectsTreeItem } from "../ProjectReferencedProjectsTreeItem";
import { TreeItemContext } from "../../TreeItemContext";
import { Project, ProjectReference } from "../../../model/Projects";
import { CspProjectReferencedProjectTreeItem } from "./CspProjectReferencedProjectTreeItem";

export class CspProjectReferencedProjectsTreeItem extends ProjectReferencedProjectsTreeItem {
    constructor(context: TreeItemContext, project: Project) {
        super(context, project, 'cps')
    }
    protected createProjectReferenceItem(childContext: TreeItemContext, ref: ProjectReference) {
        return new CspProjectReferencedProjectTreeItem(childContext, ref);
    }
}