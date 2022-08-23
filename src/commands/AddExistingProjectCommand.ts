import { TreeItem } from "@tree";
import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { CliCommandBase } from "@commands/base/CliCommandBase";
import { StaticCommandParameter } from "@commands/parameters/StaticCommandParameter";
import { OpenFileCommandParameter } from "@commands/parameters/OpenFileCommandParameter";

export class AddExistingProjectCommand extends CliCommandBase {
    constructor(provider: SolutionExplorerProvider) {
        super('Add existing project', provider, 'dotnet');
    }

    protected shouldRun(item: TreeItem): boolean {
        if (!item || !item.path) { return false; }

        let options = {
		    openLabel: 'Add',
    		canSelectFolders: false,
    		canSelectMany: false,
		    filters: { ['Projects']: [ 'csproj', 'vbproj', 'fsproj' ] }
        };
        this.parameters = [
            new StaticCommandParameter('sln'),
            new StaticCommandParameter(item.path),
            new StaticCommandParameter('add'),
            new OpenFileCommandParameter(options)
        ];

        return true;
    }
}
