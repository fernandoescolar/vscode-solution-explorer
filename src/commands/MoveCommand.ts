import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem, ContextValues } from "@tree";
import { CommandBase } from "@commands/base";
import { InputOptionsCommandParameter } from "@commands/parameters/InputOptionsCommandParameter";

export class MoveCommand extends CommandBase {

    constructor(private readonly provider: SolutionExplorerProvider) {
        super('Move');
    }

    protected shouldRun(item: TreeItem): boolean {
        if (!item || !item.project) { return false; }

        this.parameters = [
            new InputOptionsCommandParameter('Select folder...', async () => await item.project?.getFolderList() ?? [])
        ];

        return true;
    }

    protected async runCommand(item: TreeItem, args: string[]): Promise<void> {
        if (!args || args.length <= 0 || !item || !item.project || !item.path) { return; }

        try {
            let newPath: string;
            if (item.contextValue.startsWith(ContextValues.projectFile)) {
                newPath = await item.project.moveFile(item.path, args[0]);
            } else if (item.contextValue.startsWith(ContextValues.projectFolder)) {
                newPath = await item.project.moveFolder(item.path, args[0]);
            } else {
                return;
            }

            this.provider.logger.log("Moved: " + item.path + " -> " + newPath);
        } catch(ex) {
            this.provider.logger.error('Can not move item: ' + ex);
        }
    }
}