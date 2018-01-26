import { spawn } from 'child_process';
import { TreeItem } from '../../tree';
import { CommandBase } from './CommandBase';

export abstract class CliCommandBase extends CommandBase {
    constructor(protected readonly app: string) {
        super();
    }

    protected runCommand(item: TreeItem, args: string[]): Promise<void> {
        return this.runCliCommand(this.app, args, item.path);
    }

    private runCliCommand(app: string, args: string[], path: string): Promise<void> {
        return new Promise(resolve => {
            let process = spawn(app, args, { cwd: path });
            let out: string[] = [];
            process.stdout.on('data', (data) => {
                out.push(data.toString());
            });
            
            process.stderr.on('data', (data) => {
                out.push(data.toString());
            });
            
            process.on('exit', (code) => {
                resolve();
            });
        });
    }
}