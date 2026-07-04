import { Action, ActionContext } from "./base/Action";
import { Solution, SolutionFolder, SolutionType } from "@core/Solutions";
import { SlnxDocumentEditor } from "@core/Solutions/slnx/SlnxDocumentEditor";

export class SlnxMoveSolutionFolder implements Action {
    constructor(protected readonly solution: Solution, protected readonly solutionItem: SolutionFolder, protected readonly folderId: string) {
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) { return; }

        if (this.solution.type !== SolutionType.Slnx) {
            throw new Error('SlnxMoveSolutionFolder can only be used with .slnx solutions');
        }

        try {
            const slnxSolution = this.solution as any;
            const root = slnxSolution.getXmlRoot();
            if (!root) {
                throw new Error('Failed to get XML root element');
            }

            const editor = new SlnxDocumentEditor(this.solution, root);

            // Determine the new parent
            let newParentItem: SolutionFolder | undefined;
            if (this.folderId !== 'root') {
                // Find the folder with matching name
                const allFolders = this.solution.getAllFolders();
                newParentItem = allFolders.find(f => f.id === this.folderId) as SolutionFolder | undefined;
            }

            // Move in XML
            const oldParentFolder = this.solutionItem.parent instanceof SolutionFolder ? this.solutionItem.parent : undefined;
            editor.moveFolder(this.solutionItem.name, oldParentFolder, newParentItem);

            // Update in-memory model
            const oldParentItems = this.solutionItem.parent 
                ? (this.solutionItem.parent as SolutionFolder)['items']
                : this.solution['items'];
            const index = oldParentItems.indexOf(this.solutionItem);
            if (index >= 0) {
                oldParentItems.splice(index, 1);
            }

            if (newParentItem) {
                (newParentItem as SolutionFolder).addItem(this.solutionItem);
                this.solutionItem.parent = newParentItem;
            } else {
                this.solution.addItem(this.solutionItem);
                this.solutionItem.parent = undefined;
            }

            // Persist to disk
            await slnxSolution.save();
        } catch (ex) {
            throw new Error('Can not move this item: ' + ex);
        }
    }

    public toString(): string {
        return `Move solution folder ${this.solutionItem.name} to ${this.folderId} in ${this.solution.name}`;
    }
}
