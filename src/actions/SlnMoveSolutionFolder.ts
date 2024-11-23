import * as fs from "@extensions/fs";
import { Action, ActionContext } from "./base/Action";
import { Solution, SolutionFolder, SolutionItem } from "@core/Solutions";

export class SlnMoveSolutionFolder implements Action {
    constructor(protected readonly solution: Solution, protected readonly solutionItem: SolutionItem, protected readonly folderId: string) {
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) { return; }

        let data: string = await fs.readFile(this.solution.fullPath);
        let lines: string[] = data.split('\n');
        let done: boolean = false;
        if (this.solutionItem.parent instanceof Solution) {
            if (this.folderId === 'root') {
                return;
            }

            let endGlobalIndex: number = -1;
            done = lines.some((line, index, arr) => {
                if (this.solutionItem && line.trim() === 'GlobalSection(NestedProjects) = preSolution') {
                    lines.splice(index + 1, 0,
                        '		' + this.solutionItem.id + ' = ' + this.folderId + '\r'
                    );
                    return true;
                }

                if (line.trim() === 'EndGlobal') {
                    endGlobalIndex = index;
                }

                return false;
            });

            if (!done && endGlobalIndex > 0) {
                lines.splice(endGlobalIndex, 0,
                    '	GlobalSection(NestedProjects) = preSolution\r',
                    '		' + this.solutionItem.id + ' = ' + this.folderId + '\r',
                    '	EndGlobalSection\r');
                done = true;
            }
        } else if (this.folderId !== 'root') {
            const parentId = this.solutionItem.parent instanceof SolutionFolder ? this.solutionItem.parent.id : '';
            const index = lines.findIndex(l => l.trim().startsWith(this.solutionItem.id + ' = ' + parentId));
            if (index >= 0) {
                lines.splice(index, 1,
                    '		' + this.solutionItem.id + ' = ' + this.folderId + '\r');
                done = true;
            }
        } else {
            const parentId = this.solutionItem.parent instanceof SolutionFolder ? this.solutionItem.parent.id : '';

            const index = lines.findIndex(l => l.trim().startsWith(this.solutionItem.id + ' = ' + parentId));
            if (index >= 0) {
                lines.splice(index, 1);
                done = true;
            }
        }

        if (done) {
            await fs.writeFile(this.solution.fullPath, lines.join('\n'));
        } else {
            throw new Error('Can not move this item');
        }
    }

    public toString(): string {
        return `Move solution folder ${this.solutionItem.name} to ${this.folderId} in ${this.solution.name}`;
    }
}
