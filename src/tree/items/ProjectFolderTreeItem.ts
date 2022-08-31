import * as path from "@extensions/path";
import { TreeItem, TreeItemCollapsibleState, TreeItemContext, ContextValues, TreeItemFactory } from "@tree";
import { ProjectItemEntry } from "@core/Projects";

export class ProjectFolderTreeItem extends TreeItem {
    constructor(context: TreeItemContext, private readonly projectFolder: ProjectItemEntry) {
        super(context, projectFolder.name, TreeItemCollapsibleState.Collapsed, ContextValues.projectFolder, projectFolder.fullPath);
        if (projectFolder.isLink) {
            this.description = "link";
        }
    }

    protected async createChildren(childContext: TreeItemContext): Promise<TreeItem[]> {
        if (!this.project) {
            return [];
        }

        let virtualPath = this.projectFolder.relativePath;
        if (virtualPath.startsWith(path.sep)) {
            virtualPath = virtualPath.substring(1);
        }

        let result: TreeItem[] = [];
        let items = await TreeItemFactory.createItemsFromProject(childContext, this.project, virtualPath);
        items.forEach(item => result.push(item));

        return result;
    }
}
