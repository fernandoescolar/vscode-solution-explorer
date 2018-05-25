import * as path from "path";
import * as os from "os";
import { spawn, execSync } from 'child_process';
import { TreeItem, ContextValues } from '../../tree';
import { CommandBase } from './CommandBase';
import { SolutionExplorerProvider } from '../../SolutionExplorerProvider';
import * as iconv from 'iconv-lite';

export abstract class CliCommandBase extends CommandBase {
    private codepage: string = "65001";

    constructor(protected readonly provider: SolutionExplorerProvider, protected readonly app: string) {
        super();
    }

    protected runCommand(item: TreeItem, args: string[]): Promise<void> {
        let workingFolder = this.getWorkingFolder(item);
        return this.runCliCommand(this.app, args, workingFolder);
    }

    protected runCliCommand(app: string, args: string[], path: string): Promise<void> {
        this.checkCurrentEncoding();
        this.provider.logger.log('Cli: ' + [ app, ...args ].join(' '));

        return new Promise(resolve => {
            let process = spawn(app, args, { cwd: path });
            
            process.stdout.on('data', (data: Buffer) => {
                this.provider.logger.log(this.decode(data));
            });
            
            process.stderr.on('data', (data: Buffer) => {
                this.provider.logger.error(this.decode(data));
            });
            
            process.on('exit', (code) => {
                this.provider.logger.log('End Cli');
                resolve();
            });
        });
    }

    private getWorkingFolder(item: TreeItem): string {
        if (item.path && item.contextValue !== ContextValues.ProjectReferencedPackage) return path.dirname(item.path);
        if (item.project) return path.dirname(item.project.fullPath);
        if (item.solution) return item.solution.FolderPath;
        return null;
    }

    private checkCurrentEncoding(): void {
        if (os.platform() === "win32") {
            this.codepage = execSync('chcp').toString().split(':').pop().trim();
        }
    }

    private decode(data: Buffer): string {
        switch (this.codepage) {
            case "932":
                return iconv.decode(data, "Shift_JIS");
            case "936":
                return iconv.decode(data, "GBK");
            default:
                return data.toString();
        }
    }
}