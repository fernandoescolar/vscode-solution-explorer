import { CliCommandBase } from "./base/CliCommandBase";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem } from "../tree/TreeItem";
import { StaticCommandParameter } from "./parameters/StaticCommandParameter";
import { InputTextCommandParameter } from "./parameters/InputTextCommandParameter";

export class RemoveProjectCommand extends CliCommandBase {
    constructor(provider: SolutionExplorerProvider) {
        super('Remove project', provider, 'dotnet');
    }

    protected shouldRun(item: TreeItem): boolean {
        this.parameters = [
            new StaticCommandParameter('sln'),
            new StaticCommandParameter(item.solution.FullPath),
            new StaticCommandParameter('remove'),
            new StaticCommandParameter(item.path),
        ];

        return true;
    }
}