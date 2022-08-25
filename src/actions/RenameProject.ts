import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import * as dialogs from "@extensions/dialogs";
import { Project } from "@core/Projects";
import { ActionContext } from "./base/Action";
import { SolutionFile } from "@core/Solutions";
import { RenameSolutionFolder } from "./RenameSolutionFolder";


export class RenameProject extends RenameSolutionFolder {
    constructor(solution: SolutionFile, private readonly project: Project, private readonly projectname: string, private readonly newprojectname: string) {
        super(solution, projectname, newprojectname);
    }

    public toString(): string {
        return `Rename project ${this.projectname} to ${this.newprojectname} in ${this.solution.name}`;
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) {
            return;
        }

        const extension = path.extname(this.project.fullPath);
        const newProjectPath = path.join(path.dirname(this.project.fullPath), this.newprojectname) + extension;
        if (newProjectPath === this.project.fullPath) {
            return;
        }

        if (await fs.exists(newProjectPath)) {
            await dialogs.showError("Project already exists");
            return;
        }

        await fs.rename(this.project.fullPath, newProjectPath);

        super.execute(context);
    }

    protected updateLines(lines: string[]): void {
        super.updateLines(lines);

        const extension = path.extname(this.project.fullPath);
        const sourceName = path.basename(this.project.fullPath);
        const targetName = this.newprojectname + extension;
        lines.some((l, index) => {
            if (l.indexOf(sourceName) >= 0) {
                let aux = l.replace(sourceName, targetName);
                lines.splice(index, 1, aux);
                return true;
            }
            return false;
        });
    }
}
