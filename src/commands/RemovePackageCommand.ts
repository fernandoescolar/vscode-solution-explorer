import { CliCommandBase } from "./base/CliCommandBase";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem } from "../tree/TreeItem";
import { StaticCommandParameter } from "./parameters/StaticCommandParameter";
import { InputTextCommandParameter } from "./parameters/InputTextCommandParameter";

export class RemovePackageCommand extends CliCommandBase {
    constructor(provider: SolutionExplorerProvider) {
        super('Remove package', provider, 'dotnet');
    }

    protected shouldRun(item: TreeItem): boolean {
        this.parameters = [
            new StaticCommandParameter('remove'),
            new StaticCommandParameter(item.project.fullPath),
            new StaticCommandParameter('package'),
            new StaticCommandParameter(item.path)
        ];

        return true;
    }
}