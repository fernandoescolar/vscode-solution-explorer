import * as path from "@extensions/path";
import { TreeItem, TreeItemCollapsibleState, TreeItemContext, ContextValues, TreeItemFactory } from "@tree";
import { ProjectFolder } from "@core/Projects";

export class ProjectFolderTreeItem extends TreeItem {
    constructor(context: TreeItemContext, private readonly projectFolder: ProjectFolder) {
        super(context, projectFolder.name, TreeItemCollapsibleState.Collapsed, ContextValues.projectFolder, projectFolder.fullPath);
    }

    protected async createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {
        if (!this.project) {
            return [];
        }

        let virtualPath = this.projectFolder.fullPath.replace(path.dirname(this.project.fullPath), '');
        if (virtualPath.startsWith(path.sep)) {
            virtualPath = virtualPath.substring(1);
        }

        let result: TreeItem[] = [];
        let items = await TreeItemFactory.createItemsFromProject(childContext, this.project, virtualPath);
        items.forEach(item => result.push(item));

        return result;
    }
}
