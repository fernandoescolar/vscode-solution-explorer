import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem, ContextValues} from "@tree";
import { CommandBase } from "@commands/base";
import { ConfirmCommandParameter } from "@commands/parameters/ConfirmCommandParameter";

export class DeleteCommand extends CommandBase {

    constructor(private readonly provider: SolutionExplorerProvider) {
        super('Delete');
    }

    protected shouldRun(item: TreeItem): boolean {
        this.parameters = [
            new ConfirmCommandParameter('Are you sure you want to delete file "'+ item.label + '"?')
        ];

        return !!item.project;
    }

    protected async runCommand(item: TreeItem, args: string[]): Promise<void> {
        if (!item || !item.project || !item.path) { return; }

        try {
            if (item.contextValue.startsWith(ContextValues.projectFile)) {
                await item.project.deleteFile(item.path);

            } else if (item.contextValue.startsWith(ContextValues.projectFolder)) {
                await item.project.deleteFolder(item.path);
            } else {
                return;
            }

            this.provider.logger.log("Deleted: " + item.path);
        } catch(ex) {
            this.provider.logger.error('Can not delete item: ' + ex);
        }
    }
}