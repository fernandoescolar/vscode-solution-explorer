import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem } from "@tree";
import { CliCommandBase } from "@commands/base";
import { StaticCommandParameter } from "@commands/parameters/StaticCommandParameter";
import { InputTextCommandParameter } from "@commands/parameters/InputTextCommandParameter";

export class CreateNewSolutionCommand extends CliCommandBase {
    constructor(provider: SolutionExplorerProvider) {
        super('Create solution', provider, 'dotnet');
    }

    protected shouldRun(item: TreeItem): boolean {
        this.parameters = [
            new StaticCommandParameter('new'),
            new StaticCommandParameter('sln'),
            new InputTextCommandParameter('Solution name', '', '-n')
        ];

        if (item && item.path) {
            this.parameters.push(new StaticCommandParameter(item.path, '-o'));
        }

        return true;
    }
}
