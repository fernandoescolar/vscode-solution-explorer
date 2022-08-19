import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem } from "@tree";
import { CliCommandBase } from "@commands/base";
import { StaticCommandParameter } from "@commands/parameters/StaticCommandParameter";

export class RemoveProjectCommand extends CliCommandBase {
    constructor(provider: SolutionExplorerProvider) {
        super('Remove project', provider, 'dotnet');
    }

    protected shouldRun(item: TreeItem): boolean {
        if (!item || !item.path) { return false; }

        this.parameters = [
            new StaticCommandParameter('sln'),
            new StaticCommandParameter(item.solution.fullPath),
            new StaticCommandParameter('remove'),
            new StaticCommandParameter(item.path),
        ];

        return true;
    }
}
