import { v4 as uuidv4 } from "uuid";
import * as fs from "@extensions/fs";
import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem } from "@tree";
import { CommandBase } from "@commands/base";
import { InputTextCommandParameter } from "@commands/parameters/InputTextCommandParameter";
import { SolutionProjectType, ProjectInSolution } from "@core/Solutions";

export class CreateSolutionFolderCommand extends CommandBase {

    constructor(private readonly provider: SolutionExplorerProvider) {
        super('Create solution folder');

        this.parameters = [
            new InputTextCommandParameter('New folder name', '')
        ];
    }

    protected shouldRun(item: TreeItem): boolean {
        return !!item.solution;
    }

    protected async runCommand(item: TreeItem, args: string[]): Promise<void> {
        if (!args || args.length <= 0) { return; }

        let projectInSolution: ProjectInSolution = (<any>item).projectInSolution;
        if (!projectInSolution) {
            if (item.solution.projects.findIndex(p => p.projectName === args[0] && p.projectType === SolutionProjectType.solutionFolder && !p.parentProjectGuid) >= 0) {
                this.provider.logger.error('Can not create solution folder, the folder already exists');
                return;
            }
        } else {
            if (item.solution.projects.findIndex(p => p.projectName === args[0] && p.projectType === SolutionProjectType.solutionFolder && p.parentProjectGuid === projectInSolution.projectGuid) >= 0) {
                this.provider.logger.error('Can not create solution folder, the folder already exists');
                return;
            }
        }

        try {
            let data: string = await fs.readFile(item.solution.fullPath);
            let lines: string[] = data.split('\n');
            let guid: string = uuidv4().toUpperCase();
            let done = lines.some((line, index, arr) => {
                if (line.trim() === 'Global') {
                    lines.splice(index, 0,
                    'Project("{2150E333-8FDC-42A3-9474-1A3956D46DE8}") = "' + args[0] + '", "' + args[0] + '", "{' + guid + '}"\r',
                    'EndProject\r');
                    return true;
                }

                return false;
            });
            if (projectInSolution && done) {
                let endGlobalIndex: number = -1;
                done = lines.some((line, index, arr) => {
                    if (projectInSolution && line.trim() === 'GlobalSection(NestedProjects) = preSolution') {
                        lines.splice(index + 1, 0,
                            '		{' + guid + '} = ' + projectInSolution.projectGuid + '\r'
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
                        '		{' + guid + '} = ' + projectInSolution.projectGuid + '\r',
                        '	EndGlobalSection\r');
                    done = true;
                }
            }

            if (done) {
                await fs.writeFile(item.solution.fullPath, lines.join('\n'));
                this.provider.logger.log("Solution folder created: " + args[0]);
            } else {
                this.provider.logger.error('Can not create solution folder');
            }
        } catch(ex) {
            this.provider.logger.error('Can not create solution folder: ' + ex);
        }
    }
}