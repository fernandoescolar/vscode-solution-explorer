import { CliCommandBase } from "./base/CliCommandBase";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem } from "../tree/TreeItem";
import { StaticCommandParameter } from "./parameters/StaticCommandParameter";
import { ContextValues } from "../tree";

export class CleanCommand extends CliCommandBase {
    constructor(provider: SolutionExplorerProvider) {
        super(provider, 'dotnet');
    }

    protected shouldRun(item: TreeItem): boolean {
        this.parameters = [
            new StaticCommandParameter('clean')
        ];

        if (item.contextValue.startsWith(ContextValues.Project))
            this.parameters.push(new StaticCommandParameter(item.path));

        return true;
    }
}