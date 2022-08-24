import * as fs from "@extensions/fs";
import { ProjectInSolution, SolutionFile } from "@core/Solutions";
import { Action, ActionContext } from "./base/Action";


export class DeleteSolutionFolder implements Action {
    constructor(private readonly solution: SolutionFile, private readonly projectInSolution: ProjectInSolution) {
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) { return; }

        let data: string = await fs.readFile(this.solution.fullPath);
        let lines: string[] = data.split('\n');
        let toDelete: ProjectInSolution[] = [this.projectInSolution];
        this.solution.projects.forEach(p => {
            if (p.parentProjectGuid === this.projectInSolution.projectGuid) {
                toDelete.push(p);
            }
        });

        toDelete.forEach(p => {
            this.deleteProject(p, lines);
        });

        await fs.writeFile(this.solution.fullPath, lines.join('\n'));
    }

    private deleteProject(p: ProjectInSolution, lines: string[]): void {
        lines.some((line, index, arr) => {
            if (line.trim().startsWith('Project(') && line.indexOf('"' + p.projectGuid + '"') > 0) {
                lines.splice(index, 2);
                return true;
            }

            return false;
        });

        let index: number;
        do {
            index = lines.findIndex(l => l.indexOf(p.projectGuid) >= 0);
            if (index >= 0) {
                lines.splice(index, 1);
            }
        } while (index >= 0);
    }
}
