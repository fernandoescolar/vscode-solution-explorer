import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem } from "@tree";
import { CliCommandBase } from "@commands/base";
import { StaticCommandParameter } from "@commands/parameters/StaticCommandParameter";

export class RunCommand extends CliCommandBase {
    constructor(provider: SolutionExplorerProvider) {
        super('Run', provider, 'dotnet');
    }

    protected shouldRun(item: TreeItem): boolean {
        if (!item || !item.path) { return false; }

        this.parameters = [
            new StaticCommandParameter('run'),
            new StaticCommandParameter(item.path, '--project')
        ];

        return true;
    }
}
