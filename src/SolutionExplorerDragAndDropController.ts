import * as vscode from "vscode";
import { SolutionTreeItemCollection, TreeItem } from "@tree";
import * as drop from "@tree/drop";
import { Action } from "@actions";
import { ActionsRunner } from "./ActionsRunner";

const SOLUTION_EXPLORER_MIME_TYPE = 'application/vnd.code.tree.solutionExplorer';
// const URI_LIST_MIME_TYPE = 'text/uri-list';

export class SolutionExplorerDragAndDropController extends vscode.Disposable implements vscode.TreeDragAndDropController<TreeItem> {
    private readonly dropHandlers: drop.DropHandler[];

    constructor(private readonly actionsRunner: ActionsRunner, private readonly solutionTreeItemCollection: SolutionTreeItemCollection) {
        super(() => this.disposing());
        this.dropHandlers = [
            new drop.CopyExternalFileInProjects(),
            new drop.CopyExternalFolderInProjects(),
            new drop.MoveFileInTheSameProject(),
            new drop.MoveFolderInTheSameProject(),
            new drop.MoveProjectInTheSameSolution(),
            new drop.MoveSolutionFolderInTheSameSolution()
        ];
    }

    public get dropMimeTypes(): string[] {
		return [ SOLUTION_EXPLORER_MIME_TYPE ];
	}

	public get dragMimeTypes(): string[] {
		return [ ];
	}

    public async handleDrop(target: TreeItem | undefined, sources: vscode.DataTransfer, token: vscode.CancellationToken): Promise<void> {
        if (!target) { return; }

        const treeItems = this.getTreeItems(sources);
        if (token.isCancellationRequested) {
            return;
        }

        const actions = await this.getDropActions(target, treeItems);
        if (token.isCancellationRequested) {
            return;
        }

        await this.actionsRunner.run(actions, token);
    }

	public handleDrag(sources: TreeItem[], treeDataTransfer: vscode.DataTransfer, token: vscode.CancellationToken): Promise<void> {
        if (token.isCancellationRequested) {
            return Promise.resolve();
        }

        const files = sources.map(s => s.id);
		treeDataTransfer.set(SOLUTION_EXPLORER_MIME_TYPE, new vscode.DataTransferItem(files));

        return Promise.resolve();
	}

    private getTreeItems(sources: vscode.DataTransfer): TreeItem[] {
        const transferItem = sources.get(SOLUTION_EXPLORER_MIME_TYPE);
        if (!transferItem) {
            return [];
        }

        const treeItems: TreeItem[] = [];
        for (const id of transferItem.value) {
            const treeItem = this.solutionTreeItemCollection.getLoadedChildTreeItemById(id);
            if (treeItem) {
                treeItems.push(treeItem);
            }
        }

        return treeItems;
    }

    private async getDropActions(target: TreeItem, treeItems: TreeItem[]): Promise<Action[]> {
        const actions: Action[] = [];
        for(const treeItem of treeItems) {
            if (!treeItem) {
                continue;
            }

            for (const dropHandler of this.dropHandlers) {
                if (await dropHandler.canHandle(treeItem, target)) {
                    const actionsForTreeItem = await dropHandler.handle(treeItem, target);
                    actions.push(...actionsForTreeItem);
                }
            }
        }

        return actions;
    }

    private disposing(): void {
        this.dropHandlers.length = 0;
    }
}
