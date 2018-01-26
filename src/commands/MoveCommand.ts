import * as vscode from "vscode";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem, IMovable, isMovable } from "../tree";
import { CommandBase } from "./base/CommandBase";
import { InputOptionsCommandParameter } from "./parameters/InputOptionsCommandParameter";

export class MoveCommand extends CommandBase {

    constructor(private readonly provider: SolutionExplorerProvider) {
        super();
    }

    protected shouldRun(item: TreeItem): boolean {
        if (!isMovable(item)) return false;
        let movable = <IMovable> (<any>item);
        this.parameters = [
            new InputOptionsCommandParameter('Select folder...', () => movable.getFolders())
        ];

        return true;
    }

    protected async runCommand(item: TreeItem, args: string[]): Promise<void> {
        if (!args || args.length <= 0) return;

        let movable = <IMovable> (<any>item);
        try {
            let newPath = await movable.move(args[0]);
            this.provider.logger.log("Moved: " + item.path + " -> " + newPath);
        } catch(ex) {
            this.provider.logger.error('Can not move item: ' + ex);
        }    
    }
}