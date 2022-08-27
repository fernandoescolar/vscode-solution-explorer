import * as fs from "@extensions/fs";
import { ProjectInSolution, SolutionFile } from "@core/Solutions";
import { Action, ActionContext } from "./base/Action";


export class DeleteSolutionFolder implements Action {
    constructor(private readonly solution: SolutionFile, private readonly projectInSolution: ProjectInSolution) {
    }

    public toString(): string {
        return `Delete folder ${this.projectInSolution.projectName} from solution ${this.solution.name}`;
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
        let projectLineIndexStart = -1, projectLineIndexEnd = -1;
        lines.some((line, index, arr) => {
            if (projectLineIndexStart < 0 && line.trim().startsWith('Project(') && line.indexOf('"' + p.projectGuid + '"') > 0) {
                projectLineIndexStart = index;
            }

            if (projectLineIndexStart >= 0 && projectLineIndexEnd < 0 && line.trim() === 'EndProject') {
                projectLineIndexEnd = index;
                return true;
            }

            return false;
        });

        if (projectLineIndexStart >= 0 && projectLineIndexEnd >= 0) {
            lines.splice(projectLineIndexStart, projectLineIndexEnd - projectLineIndexStart + 1);
        }

        let index: number;
        do {
            index = lines.findIndex(l => l.indexOf(p.projectGuid) >= 0);
            if (index >= 0) {
                lines.splice(index, 1);
            }
        } while (index >= 0);
    }
}
