import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem } from "@tree";
import { SolutionProjectType, ProjectInSolution, SolutionFile } from "@core/Solutions";
import { CommandBase } from "@commands/base";
import { InputOptionsCommandParameter } from "@commands/parameters/InputOptionsCommandParameter";

export class MoveToSolutionFolderCommand extends CommandBase {

    constructor(private readonly provider: SolutionExplorerProvider) {
        super('Move to solution folder');
    }

    protected shouldRun(item: TreeItem): boolean {
        this.parameters = [
            new InputOptionsCommandParameter('Select folder...', () => this.getFolders(item.solution))
        ];

        return !!item.solution;
    }

    protected async runCommand(item: TreeItem, args: string[]): Promise<void> {
        if (!args || args.length <= 0) { return; }

        let projectInSolution: ProjectInSolution = (<any>item).projectInSolution;
        if (!projectInSolution) {
            this.provider.logger.error('Can not move this item');
            return;
        }

        try {
            let data: string = await fs.readFile(item.solution.fullPath);
            let lines: string[] = data.split('\n');
            let done: boolean = false;
            if (!projectInSolution.parentProjectGuid) {
                if (args[0] === 'root') {
                    return;
                }

                let endGlobalIndex: number = -1;
                done = lines.some((line, index, arr) => {
                    if (projectInSolution && line.trim() === 'GlobalSection(NestedProjects) = preSolution') {
                        lines.splice(index + 1, 0,
                            '		' + projectInSolution.projectGuid + ' = ' + args[0] + '\r',
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
                        '		' + projectInSolution.projectGuid + ' = ' + args[0] + '\r',
                        '	EndGlobalSection\r');
                    done = true;
                }
            } else if (args[0] !== 'root') {
                let index = lines.findIndex(l => l.trim().startsWith(projectInSolution.projectGuid + ' = ' + projectInSolution.parentProjectGuid));
                if (index >= 0) {
                    lines.splice(index, 1,
                        '		' + projectInSolution.projectGuid + ' = ' + args[0] + '\r',);
                        done = true;
                }
            } else {
                let index = lines.findIndex(l => l.trim().startsWith(projectInSolution.projectGuid + ' = ' + projectInSolution.parentProjectGuid));
                if (index >= 0) {
                    lines.splice(index, 1);
                    done = true;
                }
            }

            if (done) {
                await fs.writeFile(item.solution.fullPath, lines.join('\n'));
                this.provider.logger.log("Solution item moved");
            } else {
                this.provider.logger.error('Can not move this item');
            }
        } catch(ex) {
            this.provider.logger.error('Can not move this item: ' + ex);
        }
    }

    private getFolders(solution: SolutionFile): Promise<{[id:string]: string}> {
        let folders: { id: string, name: string }[] = [];
        solution.projects.forEach(p => {
            if (p.projectType === SolutionProjectType.solutionFolder) {
                folders.push( { id: p.projectGuid, name: this.getFolderName(p, solution) });
            }
        });

        folders.sort((a, b) => {
            let x = a.name.toLowerCase();
            let y = b.name.toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
        });

        let result: {[id:string]: string} = {};
        result[path.sep] = 'root';
        folders.forEach(f => {
            result[f.name] = f.id;
        });

        return Promise.resolve(result);
    }

    private getFolderName(p: ProjectInSolution, solution: SolutionFile): any {
        if (!p.parentProjectGuid) { return  path.sep + p.projectName; }

        let parent = solution.projectsById[p.parentProjectGuid];
        return this.getFolderName(parent, solution) + path.sep + p.projectName;
    }
}