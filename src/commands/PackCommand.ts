import { CliCommandBase } from "./base/CliCommandBase";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem } from "../tree/TreeItem";
import { StaticCommandParameter } from "./parameters/StaticCommandParameter";
import { ContextValues } from "../tree";

export class PackCommand extends CliCommandBase {
    constructor(provider: SolutionExplorerProvider) {
        super('Pack', provider, 'dotnet');
    }

    protected shouldRun(item: TreeItem): boolean {
        this.parameters = [
            new StaticCommandParameter('pack'),
            new StaticCommandParameter(item.path)
        ];

        return true;
    }
}