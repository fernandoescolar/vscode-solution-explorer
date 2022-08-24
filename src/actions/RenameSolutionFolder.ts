import * as fs from "@extensions/fs";
import { Action, ActionContext } from "./base/Action";
import { SolutionFile } from "@core/Solutions";


export class RenameSolutionFolder implements Action {
    constructor(protected readonly solution: SolutionFile, private readonly folderName: string, private readonly newFolderName: string) {
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) {
            return;
        }

        let data: string = await fs.readFile(this.solution.fullPath);
        let lines: string[] = data.split('\n');
        lines.some((l, index) => {
            if (l.indexOf('"' + this.folderName + '"') >= 0) {
                let aux = l;
                while (aux.indexOf('"' + this.folderName + '"') >= 0) {
                    aux = aux.replace('"' + this.folderName + '"', '"' + this.newFolderName + '"');
                }
                lines.splice(index, 1, aux);
                return true;
            }
            return false;
        });

        await fs.writeFile(this.solution.fullPath, lines.join('\n'));
    }

    protected updateLines(lines: string[]): void {
        lines.some((l, index) => {
            if (l.indexOf('"' + this.folderName + '"') >= 0) {
                let aux = l;
                while (aux.indexOf('"' + this.folderName + '"') >= 0) {
                    aux = aux.replace('"' + this.folderName + '"', '"' + this.newFolderName + '"');
                }
                lines.splice(index, 1, aux);
                return true;
            }
            return false;
        });
    }
}
