import { t } from "@extensions/translations";
import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import * as dialogs from "@extensions/dialogs";
import { Action, ActionContext } from "./base/Action";
import { Solution, SolutionFolder, SolutionType } from "@core/Solutions";
import { SlnxDocumentEditor } from "@core/Solutions/slnx/SlnxDocumentEditor";

type CopyFileOptions = "Yes" | "Skip" | "Cancel";

export class SlnxAddSolutionFile implements Action {
    constructor(private readonly solution: Solution, private readonly solutionItem: SolutionFolder, private filePath: string) {
    }

    public toString(): string {
        return `Add file ${this.filePath} to folder ${this.solutionItem.name} in solution ${this.solution.name}`;
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) {
            return;
        }

        if (this.solution.type !== SolutionType.Slnx) {
            throw new Error('SlnxAddSolutionFile can only be used with .slnx solutions');
        }



        const relativeFilePath = await this.getRelativeFilePath(context, this.filePath);
        if (!relativeFilePath) {
            return;
        }

        await this.addFileToSolutionFolder(relativeFilePath);
    }

    private async getRelativeFilePath(context: ActionContext, fileFullPath: string): Promise<string | undefined> {
        const solutionFolderPath = path.dirname(this.solution.fullPath);
        if (!fileFullPath.startsWith(solutionFolderPath)) {
            const filename = path.basename(fileFullPath);
            if (await this.question(context, filename) === "Yes") {
                const targetPath = path.join(solutionFolderPath, filename);
                await fs.copy(fileFullPath, targetPath);
                fileFullPath = targetPath;
            } else {
                return;
            }
        }

        return path.relative(solutionFolderPath, fileFullPath).replace(/\//g, '\\');
    }

    public async question(context: ActionContext, filename: string): Promise<CopyFileOptions> {
        const options = [ "Yes", "Skip" ];
        if (context.yesAll) {
            return 'Yes';
        }

        if (context.skipAll) {
            return 'Skip';
        }

        if (context.multipleActions) {
            options.push('Yes All', 'Skip All');
        }

        const option = await dialogs.confirm(t("The file {0} is out of the solution scope, do you want to create a copy?", filename), ...options);

        if (option === 'Yes All') {
            context.yesAll = true;
            return 'Yes';
        }

        if (option === 'Skip All') {
            context.skipAll = true;
            return 'Skip';
        }

        if (!option) {
            context.cancelled = true;
            return 'Cancel';
        }

        return option as CopyFileOptions;
    }

    private async addFileToSolutionFolder(relativeFilePath: string) {
        const slnxSolution = this.solution as any;
        const root = slnxSolution.getXmlRoot();
        if (!root) {
            throw new Error('Failed to get XML root element');
        }

        const editor = new SlnxDocumentEditor(this.solution, root);
        const filename = path.basename(relativeFilePath);

        // Add to XML
        editor.addSolutionFile(filename, relativeFilePath, this.solutionItem as SolutionFolder);

        // Update in-memory model
        (this.solutionItem as SolutionFolder).solutionFiles[filename] = relativeFilePath;

        // Persist to disk
        await slnxSolution.save();
    }
}
