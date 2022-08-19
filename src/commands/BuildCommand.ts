import { CliCommandBase } from "@commands/base";
import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem } from "@tree";
import { StaticCommandParameter } from "@commands/parameters/StaticCommandParameter";

export class BuildCommand extends CliCommandBase {
    constructor(provider: SolutionExplorerProvider) {
        super('Build', provider, 'dotnet');
    }

    protected shouldRun(item: TreeItem): boolean {
        if (!item || !item.path) { return false; }

        this.parameters = [
            new StaticCommandParameter('build'),
            new StaticCommandParameter(item.path)
        ];

        return true;
    }
}
