import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem } from "@tree";
import { CliCommandBase } from "@commands/base";
import { StaticCommandParameter } from "@commands/parameters/StaticCommandParameter";

export class RemovePackageCommand extends CliCommandBase {
    constructor(provider: SolutionExplorerProvider) {
        super('Remove package', provider, 'dotnet');
    }

    protected shouldRun(item: TreeItem): boolean {
        if (!item || !item.project || !item.path) { return false; }
        this.parameters = [
            new StaticCommandParameter('remove'),
            new StaticCommandParameter(item.project.fullPath),
            new StaticCommandParameter('package'),
            new StaticCommandParameter(item.path)
        ];

        return true;
    }
}
