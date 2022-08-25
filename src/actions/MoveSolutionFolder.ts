import * as fs from "@extensions/fs";
import { Action, ActionContext } from "./base/Action";
import { ProjectInSolution, SolutionFile } from "@core/Solutions";

export class MoveSolutionFolder implements Action {
    constructor(protected readonly solution: SolutionFile, protected readonly projectInSolution: ProjectInSolution, protected readonly targetPath: string) {
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) { return; }

        let data: string = await fs.readFile(this.solution.fullPath);
        let lines: string[] = data.split('\n');
        let done: boolean = false;
        if (!this.projectInSolution.parentProjectGuid) {
            if (this.targetPath === 'root') {
                return;
            }

            let endGlobalIndex: number = -1;
            done = lines.some((line, index, arr) => {
                if (this.projectInSolution && line.trim() === 'GlobalSection(NestedProjects) = preSolution') {
                    lines.splice(index + 1, 0,
                        '		' + this.projectInSolution.projectGuid + ' = ' + this.targetPath + '\r'
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
                    '		' + this.projectInSolution.projectGuid + ' = ' + this.targetPath + '\r',
                    '	EndGlobalSection\r');
                done = true;
            }
        } else if (this.targetPath !== 'root') {
            let index = lines.findIndex(l => l.trim().startsWith(this.projectInSolution.projectGuid + ' = ' + this.projectInSolution.parentProjectGuid));
            if (index >= 0) {
                lines.splice(index, 1,
                    '		' + this.projectInSolution.projectGuid + ' = ' + this.targetPath + '\r');
                done = true;
            }
        } else {
            let index = lines.findIndex(l => l.trim().startsWith(this.projectInSolution.projectGuid + ' = ' + this.projectInSolution.parentProjectGuid));
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
        return `Move solution folder ${this.projectInSolution.projectName} to ${this.targetPath}in ${this.solution.name}`;
    }
}
