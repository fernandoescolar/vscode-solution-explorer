import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem } from "@tree";
import { CliCommandBase } from "@commands/base";
import { StaticCommandParameter } from "@commands/parameters/StaticCommandParameter";
import { InputTextCommandParameter } from "@commands/parameters/InputTextCommandParameter";
import { OptionalCommandParameter } from "@commands/parameters/OptionalCommandParameter";

export class AddPackageCommand extends CliCommandBase {
    constructor(provider: SolutionExplorerProvider) {
        super('Add package', provider, 'dotnet');
    }

    protected shouldRun(item: TreeItem): boolean {
        if (!item || !item.project) { return false; }

        this.parameters = [
            new StaticCommandParameter('add'),
            new StaticCommandParameter(item.project.fullPath),
            new StaticCommandParameter('package'),
            new InputTextCommandParameter('Package Name', ''),
            new OptionalCommandParameter('Would you like to specify the package version?', new InputTextCommandParameter('Package version', '1.0.0.0', '-v'))
        ];

        return true;
    }
}
