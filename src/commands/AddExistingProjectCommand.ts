import * as path from "path";
import { CliCommandBase } from "./base/CliCommandBase";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem } from "../tree/TreeItem";
import { StaticCommandParameter } from "./parameters/StaticCommandParameter";
import { OpenFileCommandParameter } from "./parameters/OpenFileCommandParameter";

export class AddExistingProjectCommand extends CliCommandBase {
    constructor(provider: SolutionExplorerProvider) {
        super(provider, 'dotnet');
    }

    protected shouldRun(item: TreeItem): boolean {
        this.parameters = [
            new StaticCommandParameter('sln'),
            new StaticCommandParameter(item.path),
            new StaticCommandParameter('add'),
            new OpenFileCommandParameter('Add')
        ];

        return true;
    }
}