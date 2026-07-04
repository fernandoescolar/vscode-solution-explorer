import { v4 as uuidv4 } from "uuid";
import * as fs from "@extensions/fs";
import { Solution, SolutionFolder, SolutionType } from "@core/Solutions";
import { Action, ActionContext } from "./base/Action";
import { SlnxDocumentEditor } from "@core/Solutions/slnx/SlnxDocumentEditor";

export class SlnxCreateSolutionFolder implements Action {
    constructor(private readonly solution: Solution, private readonly folderName: string, private readonly parentItem?: SolutionFolder) {
    }

    public toString(): string {
        return `Create solution folder ${this.folderName} in solution ${this.solution.name}`;
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) { return; }

        if (this.solution.type !== SolutionType.Slnx) {
            throw new Error('SlnxCreateSolutionFolder can only be used with .slnx solutions');
        }

        // Verify folder doesn't already exist
        if (!this.parentItem) {
            if (this.solution.getFolders().some(p => p.name === this.folderName)) {
                throw new Error('Can not create solution folder, the folder already exists');
            }
        } else {
            if (this.parentItem instanceof SolutionFolder && this.parentItem.getFolders().some(p => p.name === this.folderName)) {
                throw new Error('Can not create solution folder, the folder already exists');
            }
        }

        try {
            const slnxSolution = this.solution as any;
            const root = slnxSolution.getXmlRoot();
            if (!root) {
                throw new Error('Failed to get XML root element');
            }

            const editor = new SlnxDocumentEditor(this.solution, root);
            const { folder } = editor.createFolder(this.folderName, this.parentItem);

            // Update the in-memory model
            if (this.parentItem) {
                this.parentItem.addItem(folder);
            } else {
                this.solution.addItem(folder);
            }

            // Persist to disk
            await slnxSolution.save();
        } catch (ex) {
            throw new Error('Can not create solution folder: ' + ex);
        }
    }
}
