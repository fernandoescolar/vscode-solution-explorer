import { TreeItem, TreeItemCollapsibleState } from "./TreeItem";
import { ProjectTreeItem } from "./ProjectTreeItem"
import { ContextValues } from "./ContextValues";
import { ProjectInSolution } from "../model/Solutions";
import { Project } from "../model/Projects";

export class CsProjectTreeItem extends ProjectTreeItem {
    constructor(project: Project, projectInSolution: ProjectInSolution) {
        super(project, projectInSolution);
    }
}