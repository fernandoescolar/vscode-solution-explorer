import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem } from "@tree";
import { CliCommandBase } from "@commands/base";
import { StaticCommandParameter } from "@commands/parameters/StaticCommandParameter";

export class TestCommand extends CliCommandBase {
    constructor(provider: SolutionExplorerProvider) {
        super('Test', provider, 'dotnet');
    }

    protected shouldRun(item: TreeItem): boolean {
        if (!item || !item.path) { return false; }

        this.parameters = [
            new StaticCommandParameter('test'),
            new StaticCommandParameter(item.path)
        ];

        return true;
    }
}