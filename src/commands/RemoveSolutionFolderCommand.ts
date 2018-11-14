import * as fs from "../async/fs"
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem, ContextValues } from "../tree";
import { CommandBase } from "./base/CommandBase";
import { SolutionProjectType, ProjectInSolution } from "../model/Solutions";

export class RemoveSolutionFolderCommand extends CommandBase {

    constructor(private readonly provider: SolutionExplorerProvider) {
        super('Remove solution folder');

        this.parameters = [
        ];
    }

    protected shouldRun(item: TreeItem): boolean {
        return !!item.solution;
    }

    protected async runCommand(item: TreeItem, args: string[]): Promise<void> {
        let projectInSolution: ProjectInSolution = (<any>item).projectInSolution;
        if (!projectInSolution) {
            this.provider.logger.error('Can not delete solution folder');
            return;
        }

        try {
            let data: string = await fs.readFile(item.solution.FullPath, 'utf8');
            let lines: string[] = data.split('\n'); 
            let toDelete: ProjectInSolution[] = [ projectInSolution ];
            item.solution.Projects.forEach(p => {
                if (p.parentProjectGuid == projectInSolution.projectGuid) {
                    toDelete.push(p);
                }
            });

            toDelete.forEach(p => {
                this.deleteProject(p, lines);
            });

            await fs.writeFile(item.solution.FullPath, lines.join('\n'));
            this.provider.logger.log("Solution folder deleted");
        } catch(ex) {
            this.provider.logger.error('Can not delete solution folder: ' + ex);
        }    
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
            if (index >= 0)
                lines.splice(index, 1);
        } while (index >= 0);
    }
}