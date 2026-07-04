import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import { Action, ActionContext } from "./base/Action";
import { Solution, SolutionFolder, SolutionType } from "@core/Solutions";
import { SlnxDocumentEditor } from "@core/Solutions/slnx/SlnxDocumentEditor";

export class SlnxDeleteSolutionFile implements Action {
    constructor(private readonly solution: Solution, private readonly solutionItem: SolutionFolder, private filePath: string) {
    }

    public toString(): string {
        return `Delete file ${this.filePath} from folder ${this.solutionItem.name} in solution ${this.solution.name}`;
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) {
            return;
        }

        if (this.solution.type !== SolutionType.Slnx) {
            throw new Error('SlnxDeleteSolutionFile can only be used with .slnx solutions');
        }

        const solutionFolderPath = path.dirname(this.solution.fullPath);
        const relativePath = path.relative(solutionFolderPath, this.filePath).replace(/\//g, '\\');
        await this.deleteFileFromSolutionFolder(relativePath);
    }

    private async deleteFileFromSolutionFolder(relativePath: string) {
        const slnxSolution = this.solution as any;
        const root = slnxSolution.getXmlRoot();
        if (!root) {
            throw new Error('Failed to get XML root element');
        }

        const editor = new SlnxDocumentEditor(this.solution, root);
        const filename = path.basename(relativePath);

        // Delete from XML
        editor.deleteSolutionFile(filename, relativePath, this.solutionItem);

        // Update in-memory model
        if (this.solutionItem.solutionFiles) {
            delete this.solutionItem.solutionFiles[filename];
        }

        // Persist to disk
        await slnxSolution.save();
    }
}
