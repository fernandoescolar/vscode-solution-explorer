import { Solution, SolutionFolder, SolutionType } from "@core/Solutions";
import { Action, ActionContext } from "./base/Action";
import { SlnxDocumentEditor } from "@core/Solutions/slnx/SlnxDocumentEditor";

export class SlnxDeleteSolutionFolder implements Action {
    constructor(private readonly solution: Solution, private readonly solutionItem: SolutionFolder) {
    }

    public toString(): string {
        return `Delete folder ${this.solutionItem.name} from solution ${this.solution.name}`;
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) { return; }

        if (this.solution.type !== SolutionType.Slnx) {
            throw new Error('SlnxDeleteSolutionFolder can only be used with .slnx solutions');
        }

        try {
            const slnxSolution = this.solution as any;
            const root = slnxSolution.getXmlRoot();
            if (!root) {
                throw new Error('Failed to get XML root element');
            }

            const editor = new SlnxDocumentEditor(this.solution, root);

            // Delete from XML
            const parentFolder = this.solutionItem.parent instanceof SolutionFolder ? this.solutionItem.parent : undefined;
            editor.deleteFolder(this.solutionItem.name, parentFolder);

            // Update in-memory model
            const parentItems = this.solutionItem.parent ? this.solutionItem.parent['items'] : this.solution['items'];
            const index = parentItems.indexOf(this.solutionItem);
            if (index >= 0) {
                parentItems.splice(index, 1);
            }

            // Persist to disk
            await slnxSolution.save();
        } catch (ex) {
            throw new Error('Can not delete solution folder: ' + ex);
        }
    }
}
