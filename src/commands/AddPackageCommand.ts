import { CliCommandBase } from "./base/CliCommandBase";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem } from "../tree/TreeItem";
import { StaticCommandParameter } from "./parameters/StaticCommandParameter";
import { InputTextCommandParameter } from "./parameters/InputTextCommandParameter";

export class AddPackageCommand extends CliCommandBase {
    constructor(provider: SolutionExplorerProvider) {
        super('Add package', provider, 'dotnet');
    }

    protected shouldRun(item: TreeItem): boolean {
        this.parameters = [
            new StaticCommandParameter('add'),
            new StaticCommandParameter(item.project.fullPath),
            new StaticCommandParameter('package'),
            new InputTextCommandParameter('Package Name', '')
        ];

        return true;
    }
}