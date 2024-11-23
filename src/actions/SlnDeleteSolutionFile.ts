import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import { Action, ActionContext } from "./base/Action";
import { SolutionItem, Solution } from "@core/Solutions";

export class SlnDeleteSolutionFile implements Action {
    constructor(private readonly solution: Solution, private readonly solutionItem: SolutionItem, private filePath: string) {
    }

    public toString(): string {
        return `Delete file ${this.filePath} from folder ${this.solutionItem.name} in solution ${this.solution.name}`;
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) {
            return;
        }

        const solutionFolderPath = path.dirname(this.solution.fullPath);
        const relativePath = path.relative(solutionFolderPath, this.filePath).replace(/\//g, '\\');
        await this.deleteFileToSolutionFolder(relativePath);
    }

    private async deleteFileToSolutionFolder(relativePath: string) {
        let data: string = await fs.readFile(this.solution.fullPath);
        let lines: string[] = data.split('\n');
        let lineIndex = -1, projectLineIndexStart = -1, projectLineIndexEnd = -1, hasSection = false;
        lines.some((line, index, arr) => {
            if (projectLineIndexStart < 0 && line.trim().startsWith('Project(') && line.indexOf('"' + this.solutionItem.id + '"') > 0) {
                projectLineIndexStart = index;
            }

            if (projectLineIndexStart >= 0 && line.trim().startsWith('ProjectSection(SolutionItems)')) {
                hasSection = true;
            }

            if (projectLineIndexStart >= 0 && hasSection && line.trim().startsWith(relativePath)) {
                lineIndex = index;
                return true;
            }

            if (projectLineIndexStart >= 0 && projectLineIndexEnd < 0 && line.trim() === 'EndProject') {
                projectLineIndexEnd = index;
                return true;
            }

            return false;
        });

        if (lineIndex >= 0) {
            lines.splice(lineIndex, 1);
            await fs.writeFile(this.solution.fullPath, lines.join('\n'));
        }
    }
}
