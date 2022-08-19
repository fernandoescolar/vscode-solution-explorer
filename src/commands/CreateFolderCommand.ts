import * as path from "@extensions/path";
import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem, ContextValues } from "@tree";
import { CommandBase } from "@commands/base";
import { InputTextCommandParameter } from "@commands/parameters/InputTextCommandParameter";

export class CreateFolderCommand extends CommandBase {

    constructor(private readonly provider: SolutionExplorerProvider) {
        super('Create folder');

        this.parameters = [
            new InputTextCommandParameter('New folder name', '')
        ];
    }

    protected shouldRun(item: TreeItem): boolean {
        return !!item.project;
    }

    protected async runCommand(item: TreeItem, args: string[]): Promise<void> {
        if (!args || args.length <= 0 || !item || !item.project || !item.path) { return; }

        try {
            let targetpath: string = item.path;
            if (!item.contextValue.startsWith(ContextValues.projectFolder)) {
                targetpath = path.dirname(targetpath);
            }

            let folderpath = path.join(targetpath, args[0]);
            await item.project.createFolder(folderpath);
            this.provider.logger.log("Folder created: " + args[0]);
        } catch(ex) {
            this.provider.logger.error('Can not create folder: ' + ex);
        }
    }
}