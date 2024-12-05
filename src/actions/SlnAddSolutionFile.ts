import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import * as dialogs from "@extensions/dialogs";
import { Action, ActionContext } from "./base/Action";
import { SolutionItem, Solution } from "@core/Solutions";

type CopyFileOptions = "Yes" | "Skip" | "Cancel";

export class SlnAddSolutionFile implements Action {
    constructor(private readonly solution: Solution, private readonly solutionItem: SolutionItem, private filePath: string) {
    }

    public toString(): string {
        return `Add file ${this.filePath} to folder ${this.solutionItem.name} in solution ${this.solution.name}`;
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) {
            return;
        }

        const relativeFilePath = await this.getRelativeFilePath(context, this.filePath);
        if (!relativeFilePath) {
            return;
        }

        await this.appFileToSolutionFolder(relativeFilePath);
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

    public async question(context: ActionContext, filename: string): Promise<CopyFileOptions>{
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

        const option = await dialogs.confirm(`The file ${filename} is out of the solution scope, do you want to create a copy?`, ...options);

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

    private async appFileToSolutionFolder(relativeFilePath: string) {
        const data: string = await fs.readFile(this.solution.fullPath);
        const lines: string[] = data.split('\n');
        let projectLineIndexStart = -1, lineIndex = -1, hasSection = false;
        lines.some((line, index, arr) => {
            if (projectLineIndexStart < 0 && line.trim().startsWith('Project(') && line.indexOf('"' + this.solutionItem.id + '"') > 0) {
                projectLineIndexStart = index;
            }

            if (projectLineIndexStart >= 0 && line.trim().startsWith('ProjectSection(SolutionItems)')) {
                hasSection = true;
            }

            if (projectLineIndexStart >= 0 && hasSection && line.trim() === 'EndProjectSection') {
                lineIndex = index;
                return true;
            }

            if (projectLineIndexStart >= 0 && lineIndex < 0 && line.trim() === 'EndProject') {
                lineIndex = index;
                return true;
            }

            return false;
        });

        if (projectLineIndexStart >= 0 && lineIndex >= 0) {
            this.updateLines(lines,projectLineIndexStart, lineIndex, relativeFilePath, !hasSection);
            await fs.writeFile(this.solution.fullPath, lines.join('\n'));
        }
    }

    protected updateLines(lines: string[],projectLineIndexStart: number, index: number, filePath: string, includeSection: boolean): void {
        const lineToAdd = '\t\t' + filePath + ' = ' + filePath + '\r';
        try {
            const sectionLines = lines.slice(projectLineIndexStart, index + 1);
            if (sectionLines.filter(l => l === lineToAdd).length > 0)
                return;
        } catch (e) { }
        const content = includeSection ?
        [
            '\tProjectSection(SolutionItems) = preProject\r',
            lineToAdd,
            '\tEndProjectSection\r'
        ] : [ lineToAdd ];

        lines.splice(index, 0, ...content);
    }
}
