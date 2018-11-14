import { CliCommandBase } from "./base/CliCommandBase";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem } from "../tree/TreeItem";
import { StaticCommandParameter } from "./parameters/StaticCommandParameter";
import { InputTextCommandParameter } from "./parameters/InputTextCommandParameter";
import { OptionalCommandParameter } from "./parameters/OptionalCommandParameter";

export class AddPackageCommand extends CliCommandBase {
    constructor(provider: SolutionExplorerProvider) {
        super('Add package', provider, 'dotnet');
    }

    protected shouldRun(item: TreeItem): boolean {
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