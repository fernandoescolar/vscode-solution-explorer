import * as uuid from "node-uuid";
import * as fs from "../async/fs"
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem, ContextValues } from "../tree";
import { CommandBase } from "./base/CommandBase";
import { InputTextCommandParameter } from "./parameters/InputTextCommandParameter";
import { SolutionProjectType, ProjectInSolution } from "../model/Solutions";

export class CreateSolutionFolderCommand extends CommandBase {

    constructor(private readonly provider: SolutionExplorerProvider) {
        super();

        this.parameters = [
            new InputTextCommandParameter('New folder name')
        ];
    }

    protected shouldRun(item: TreeItem): boolean {
        return !!item.solution;
    }

    protected async runCommand(item: TreeItem, args: string[]): Promise<void> {
        if (!args || args.length <= 0) return;

        let projectInSolution: ProjectInSolution = (<any>item).projectInSolution;
        if (!projectInSolution) {
            if (item.solution.Projects.findIndex(p => p.projectName == args[0] && p.projectType == SolutionProjectType.SolutionFolder && !p.parentProjectGuid) >= 0) {
                this.provider.logger.error('Can not create solution folder, the folder already exists');
                return;
            }
        } else {
            if (item.solution.Projects.findIndex(p => p.projectName == args[0] && p.projectType == SolutionProjectType.SolutionFolder && p.parentProjectGuid == projectInSolution.projectGuid) >= 0) {
                this.provider.logger.error('Can not create solution folder, the folder already exists');
                return;
            }
        }

        try {
            let data: string = await fs.readFile(item.solution.FullPath, 'utf8');
            let lines: string[] = data.split('\n'); 
            let guid: string = uuid.v1().toUpperCase();
            let done = lines.some((line, index, arr) => {
                if (line.trim() == 'Global') {
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
                    if (projectInSolution && line.trim() == 'GlobalSection(NestedProjects) = preSolution') {
                        lines.splice(index + 1, 0,
                            '		{' + guid + '} = ' + projectInSolution.projectGuid + '\r'
                        );
                        return true;
                    }    

                    if (line.trim() == 'EndGlobal') {
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
                await fs.writeFile(item.solution.FullPath, lines.join('\n'));
                this.provider.logger.log("Solution folder created: " + args[0]);
            }
            else {
                this.provider.logger.error('Can not create solution folder');
            }
        } catch(ex) {
            this.provider.logger.error('Can not create solution folder: ' + ex);
        }    
    }
}