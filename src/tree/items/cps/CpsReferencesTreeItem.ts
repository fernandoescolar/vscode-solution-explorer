import { ProjectReferencesTreeItem } from "../ProjectReferencesTreeItem";
import { TreeItemContext } from "../../TreeItemContext";
import { TreeItem } from "../../TreeItem";
import { CspProjectReferencedProjectsTreeItem } from "./CspProjectReferencedProjectsTreeItem";
import { CspProjectReferencedPackagesTreeItem } from "./CspProjectReferencedPackagesTreeItem";

export class CpsProjectReferencesTreeItem extends ProjectReferencesTreeItem {
    protected createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {  
        let result: TreeItem[] = [];
        result.push(new CspProjectReferencedProjectsTreeItem(childContext, this.project));
        result.push(new CspProjectReferencedPackagesTreeItem(childContext, this.project));

        return Promise.resolve(result);
    }
}