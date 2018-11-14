import { CliCommandBase } from "./base/CliCommandBase";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem } from "../tree/TreeItem";
import { StaticCommandParameter } from "./parameters/StaticCommandParameter";
import { ContextValues } from "../tree";

export class BuildCommand extends CliCommandBase {
    constructor(provider: SolutionExplorerProvider) {
        super('Build', provider, 'dotnet');
    }

    protected shouldRun(item: TreeItem): boolean {
        this.parameters = [
            new StaticCommandParameter('build'),
            new StaticCommandParameter(item.path)
        ];

        return true;
    }
}