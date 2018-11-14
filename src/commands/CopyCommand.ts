import * as clipboardy from "clipboardy";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem, ContextValues } from "../tree";
import { CommandBase } from "./base/CommandBase";

export class CopyCommand extends CommandBase {
    
    constructor(private readonly provider: SolutionExplorerProvider) {
        super('Copy');
    }

    protected shouldRun(item: TreeItem): boolean {
        if (item && item.path) return true;
        return false;
    }

    protected async runCommand(item: TreeItem, args: string[]): Promise<void> {    
        await clipboardy.write(item.path);
    }
}