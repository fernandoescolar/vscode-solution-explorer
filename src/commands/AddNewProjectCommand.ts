import { execSync } from 'child_process';
import * as path from "@extensions/path";
import * as dialogs from '@extensions/dialogs';
import { ContextValues, TreeItem } from "@tree";
import { Action, AddExistingProject, CreateProject } from '@actions';
import { ActionsCommand } from "@commands";

type ProjectType = { name: string, value: string, languages: string[] };

const PROJECT_TYPES: ProjectType[] = [
    // { name: 'Console application', value: 'console', languages: ['C#', 'F#', 'VB'] },
    // { name: 'Class library', value: 'classlib', languages: ['C#', 'F#', 'VB'] },
    // { name: 'WPF Application', value: 'wpf', languages: ['C#'] },
    // { name: 'WPF Class library', value: 'wpflib', languages: ['C#'] },
    // { name: 'WPF Custom Control Library', value: 'wpfcustomcontrollib', languages: ['C#'] },
    // { name: 'WPF User Control Library', value: 'wpfusercontrollib', languages: ['C#'] },
    // { name: 'Windows Forms (WinForms) Application', value: 'winforms', languages: ['C#'] },
    // { name: 'Windows Forms (WinForms) Class library', value: 'winformslib', languages: ['C#'] },
    // { name: 'Worker Service', value: 'worker', languages: ['C#'] },
    // { name: 'Unit test project', value: 'mstest', languages: ['C#', 'F#', 'VB'] },
    // { name: 'xUnit test project', value: 'xunit', languages: ['C#', 'F#', 'VB'] },
    // { name: 'NUnit 3 Test Project', value: 'nunit', languages: ['C#', 'F#', 'VB'] },
    // { name: 'ASP.NET Core empty', value: 'web', languages: ['C#', 'F#'] },
    // { name: 'ASP.NET Core Web App (Model-View-Controller)', value: 'mvc', languages: ['C#', 'F#'] },
    // { name: 'ASP.NET Core Web App', value: 'razor', languages: ['C#'] },
    // { name: 'ASP.NET Core with Angular', value: 'angular', languages: ['C#'] },
    // { name: 'ASP.NET Core with React.js', value: 'react', languages: ['C#'] },
    // { name: 'ASP.NET Core with React.js and Redux', value: 'reactredux', languages: ['C#'] },
    // { name: 'ASP.NET Core Web API', value: 'webapi', languages: ['C#', 'F#'] },
    // { name: 'ASP.NET Core gRPC Service', value: 'grpc', languages: ['C#'] },
    // { name: 'Blazor Server App', value: 'blazorserver', languages: ['C#'] },
    // { name: 'Blazor WebAssembly App', value: 'blazorwasm', languages: ['C#'] },
    // { name: 'Razor Class Library', value: 'razorclasslib', languages: ['C#'] },
];

export class AddNewProjectCommand extends ActionsCommand {
    private wizard: dialogs.Wizard | undefined;

    constructor() {
        super('Add new project');
    }

    public  shouldRun(item: TreeItem): boolean {
        return item && !!item.path && (item.contextValue === ContextValues.solution || item.contextValue === ContextValues.solution + '-cps');
    }

    public async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || ! item.path) { return []; }

        this.loadProjectTemplates();
        this.wizard = dialogs.wizard('Add new project')
                             .selectOption('Select project type', this.getProjectTypes())
                             .selectOption('Select language', () => this.getLanguages())
                             .getText('Project name')
                             .getText('Folder name', '', () => this.getCurrentProjectName());

        const parameters = await this.wizard .run();
        if (!parameters) { return []; }

        const workingpath = path.dirname(item.path);
        let projectPath = path.join(workingpath, parameters[3], parameters[2]);
        if (parameters[1] === 'C#') { projectPath += '.csproj'; }
        if (parameters[1] === 'F#') { projectPath += '.fsproj'; }
        if (parameters[1] === 'VB') { projectPath += '.vbproj'; }

        return [
            new CreateProject(parameters[0], parameters[1], parameters[2], parameters[3], workingpath),
            new AddExistingProject(item.path, projectPath)
        ];
    }

    private loadProjectTemplates(): void {
        if (PROJECT_TYPES.length > 0) { return; }

        let buffer = execSync('dotnet new --list');
        if (!buffer) {
            return;
        }

        let lines = buffer.toString().split('\n');
        if (lines.length > 4) {
            lines.splice(0, 4); /* ignore header */
            lines.forEach(line => {
                let parts = line.split('  ').filter(element => element);
                if (parts.length > 2) {
                    const projectType = {
                        name: parts[0].trim(),
                        value: parts[1].trim(),
                        languages: parts[2].split(',').map(element => element.trim().replace('[', '').replace(']', ''))
                    };
                    if (projectType.languages.length > 0) {
                        PROJECT_TYPES.push(projectType);
                    }
                }
            });
        }
    }

    private getProjectTypes(): { [id:string]: string } {
        let result: { [id:string]: string } = {};
        PROJECT_TYPES.forEach(pt => {
            result[pt.name] = pt.value;
        });
        return result;
    }

    private getLanguages(): Promise<string[]> {
        let result: string[] =  [ 'C#' ];
        if (this.wizard && this.wizard.context && this.wizard.context.results[0]) {
            let selectedProject = this.wizard.context.results[0];
            let index = PROJECT_TYPES.findIndex(pt => pt.value === selectedProject);
            if (index >= 0) {
                result = PROJECT_TYPES[index].languages;
            }
        }

        return Promise.resolve(result);
    }

    private getCurrentProjectName(): Promise<string> {
        if (this.wizard && this.wizard.context && this.wizard.context.results[2]) {
            return Promise.resolve(this.wizard.context.results[2]);
        }

        return Promise.resolve("");
    }
}
