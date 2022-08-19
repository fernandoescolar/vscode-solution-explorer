import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem } from "@tree";
import { CliCommandBase } from "@commands/base";
import { StaticCommandParameter } from "@commands/parameters/StaticCommandParameter";

export class PackCommand extends CliCommandBase {
    constructor(provider: SolutionExplorerProvider) {
        super('Pack', provider, 'dotnet');
    }

    protected shouldRun(item: TreeItem): boolean {
        if (!item || !item.path) { return false; }

        this.parameters = [
            new StaticCommandParameter('pack'),
            new StaticCommandParameter(item.path)
        ];

        return true;
    }
}
