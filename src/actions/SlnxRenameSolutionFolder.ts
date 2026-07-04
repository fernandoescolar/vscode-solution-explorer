import * as fs from "@extensions/fs";
import { Action, ActionContext } from "./base/Action";
import { Solution, SolutionFolder, SolutionType } from "@core/Solutions";
import { SlnxDocumentEditor } from "@core/Solutions/slnx/SlnxDocumentEditor";

export class SlnxRenameSolutionFolder implements Action {
    constructor(protected readonly solution: Solution, private readonly folderName: string, private readonly newFolderName: string) {
    }

    public toString(): string {
        return `Rename folder ${this.folderName} to ${this.newFolderName} in solution ${this.solution.name}`;
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) {
            return;
        }

        if (this.solution.type !== SolutionType.Slnx) {
            throw new Error('SlnxRenameSolutionFolder can only be used with .slnx solutions');
        }

        try {
            const slnxSolution = this.solution as any;
            const root = slnxSolution.getXmlRoot();
            if (!root) {
                throw new Error('Failed to get XML root element');
            }

            const editor = new SlnxDocumentEditor(this.solution, root);
            
            // Rename in XML
            editor.renameFolder(this.folderName, this.newFolderName);

            // Update in-memory model
            const allFolders = this.solution.getAllFolders();
            const folder = allFolders.find(f => f.name === this.folderName);
            if (folder) {
                folder.name = this.newFolderName;
            }

            // Persist to disk
            await slnxSolution.save();
        } catch (ex) {
            throw new Error('Can not rename solution folder: ' + ex);
        }
    }

    protected updateLines(lines: string[]): void {
        // Not used in .slnx version
    }
}
