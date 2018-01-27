import * as path from "path";
import { spawn } from 'child_process';
import { TreeItem } from '../../tree';
import { CommandBase } from './CommandBase';
import { SolutionExplorerProvider } from '../../SolutionExplorerProvider';

export abstract class CliCommandBase extends CommandBase {
    constructor(protected readonly provider: SolutionExplorerProvider, protected readonly app: string) {
        super();
    }

    protected runCommand(item: TreeItem, args: string[]): Promise<void> {
        let workingFolder = path.dirname(item.path);
        return this.runCliCommand(this.app, args, workingFolder);
    }

    private runCliCommand(app: string, args: string[], path: string): Promise<void> {
        this.provider.logger.log('Cli: ' + [ app, ...args ].join(' '));

        return new Promise(resolve => {
            let process = spawn(app, args, { cwd: path });
            
            process.stdout.on('data', (data: string) => {
                this.provider.logger.log(data);
            });
            
            process.stderr.on('data', (data: string) => {
                this.provider.logger.log(data);
            });
            
            process.on('exit', (code) => {
                this.provider.logger.log('End Cli');
                resolve();
            });
        });
    }
}