import * as path from "path";
import { CliCommandBase } from "./base/CliCommandBase";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem } from "../tree/TreeItem";
import { StaticCommandParameter } from "./parameters/StaticCommandParameter";
import { InputTextCommandParameter } from "./parameters/InputTextCommandParameter";
import { InputOptionsCommandParameter } from "./parameters/InputOptionsCommandParameter";

const ProjectTypes = [
    { name: 'Console application', value: 'console', languages: ['C#', 'F#', 'VB'] },
    { name: 'Class library', value: 'classlib', languages: ['C#', 'F#', 'VB'] },
    { name: 'Unit test project', value: 'mstest', languages: ['C#', 'F#', 'VB'] },
    { name: 'xUnit test project', value: 'xunit', languages: ['C#', 'F#', 'VB'] },
    { name: 'ASP.NET Core empty', value: 'web', languages: ['C#', 'F#'] },
    { name: 'ASP.NET Core Web App (Model-View-Controller)', value: 'mvc', languages: ['C#', 'F#'] },
    { name: 'ASP.NET Core Web App', value: 'razor', languages: ['C#'] },
    { name: 'ASP.NET Core with Angular', value: 'angular', languages: ['C#'] },
    { name: 'ASP.NET Core with React.js', value: 'react', languages: ['C#'] },
    { name: 'ASP.NET Core with React.js and Redux', value: 'reactredux', languages: ['C#'] },
    { name: 'ASP.NET Core Web API', value: 'webapi', languages: ['C#', 'F#'] }
];

export class AddNewProjectCommand extends CliCommandBase {
    constructor(provider: SolutionExplorerProvider) {
        super(provider, 'dotnet');
    }

    public async run(item: TreeItem): Promise<void> {
        await super.run(item);
        await this.addProjectToSolution(item);
    }

    protected shouldRun(item: TreeItem): boolean {
        this.parameters = [
            new StaticCommandParameter('new'),
            new InputOptionsCommandParameter('Select project type', this.getProjectTypes()),
            new InputOptionsCommandParameter('Select language', () => this.getLanguages(), '-lang'),
            new InputTextCommandParameter('Project name...', '-n'),
            new InputTextCommandParameter('Folder name...', '-o', () => this.getDefaultFolder()),
        ];

        return true;
    }

    private getProjectTypes(): { [id:string]: string } {
        let result: { [id:string]: string } = {};
        ProjectTypes.forEach(pt => {
            result[pt.name] = pt.value;
        });
        return result;
    }

    private getLanguages(): Promise<string[]> {
        let result: string[] =  [ 'C#' ];
        let selectedProject = this.args[this.args.length - 1];
        let index = ProjectTypes.findIndex(pt => pt.value == selectedProject);
        if (index >= 0)
            result = ProjectTypes[index].languages;

        return Promise.resolve(result);
    }

    private addProjectToSolution(item: TreeItem): Promise<void> {
        let workingpath = path.dirname(item.path);
        let projectPath = path.join(workingpath, this.args[this.args.length - 1], this.args[this.args.length - 3]);
        if (this.args[this.args.length - 5] == 'C#') projectPath += '.csproj';
        if (this.args[this.args.length - 5] == 'F#') projectPath += '.fsproj';
        if (this.args[this.args.length - 5] == 'VB') projectPath += '.vbproj';

        return this.runCliCommand('dotnet', ['sln', item.path, 'add', projectPath], workingpath);
    }

    private getDefaultFolder(): Promise<string> {
        return Promise.resolve(this.args[this.args.length - 1]);
    }
}