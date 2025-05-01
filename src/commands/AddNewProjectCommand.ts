import * as path from "@extensions/path";
import * as dialogs from '@extensions/dialogs';
import { ContextValues, TreeItem } from "@tree";
import { Action, DotNetAddExistingProject, DotNetCreateProject } from '@actions';
import { SingleItemActionsCommand } from "@commands";
import { SolutionExplorerProvider } from '@SolutionExplorerProvider';
import { execSync } from '@extensions/child_process';

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

export class AddNewProjectCommand extends SingleItemActionsCommand {
    private wizard: dialogs.Wizard | undefined;

    constructor(private readonly provider: SolutionExplorerProvider) {
        super('Add new project');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return !item || (item && !!item.path && (item.contextValue === ContextValues.solution || item.contextValue === ContextValues.solution + '-cps'));
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
        this.loadProjectTemplates();
        this.wizard = dialogs.wizard('Add new project')
            .selectOption('Select solution', this.getSolutions(item))
            .selectOption('Select project type', this.getProjectTypes())
            .selectOption('Select language', () => this.getLanguages())
            .getText('Project name')
            .getText('Folder name', '', () => this.getCurrentProjectName());

        const parameters = await this.wizard.run();
        if (!parameters || parameters.length < 5) { return []; }

        const solution = parameters[0];
        const projectType = parameters[1];
        const language = parameters[2];
        const projectName = parameters[3];
        const folderName = parameters[4];
        const workingpath = path.dirname(solution);

        let projectPath = path.join(workingpath, folderName, projectName);
        if (language === 'C#') { projectPath += '.csproj'; }
        if (language === 'F#') { projectPath += '.fsproj'; }
        if (language === 'VB') { projectPath += '.vbproj'; }

        return [
            new DotNetCreateProject(projectType, language, projectName, folderName, workingpath),
            new DotNetAddExistingProject(solution, projectPath)
        ];
    }

    private getSolutions(item: TreeItem | undefined): dialogs.ItemsOrItemsResolver {
        if (item && item.path) {
            const result: { [id: string]: string } = {};
            result[item.label] = item.path;
            return result;
        }

        return async () => {
            const result: { [id: string]: string } = {};
            const children = await this.provider.getChildren();
            if (!children) { return result; }

            children.forEach(child => {
                if (child && child.path) {
                    result[child.label] = child.path;
                }
            });

            return result;
        };
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
                        value: parts[1].trim().split(',')[0],
                        languages: parts[2].split(',').map(element => element.trim().replace('[', '').replace(']', ''))
                    };
                    if (projectType.languages.length > 0) {
                        PROJECT_TYPES.push(projectType);
                    }
                }
            });
        }
    }

    private getProjectTypes(): { [id: string]: string } {
        let result: { [id: string]: string } = {};
        PROJECT_TYPES.forEach(pt => {
            result[pt.name] = pt.value;
        });
        return result;
    }

    private getLanguages(): Promise<string[]> {
        let result: string[] = ['C#'];
        if (this.wizard && this.wizard.context && this.wizard.context.results[1]) {
            let selectedProject = this.wizard.context.results[1];
            let index = PROJECT_TYPES.findIndex(pt => pt.value === selectedProject);
            if (index >= 0) {
                result = PROJECT_TYPES[index].languages;
            }
        }

        return Promise.resolve(result);
    }

    private getCurrentProjectName(): Promise<string> {
        if (this.wizard && this.wizard.context && this.wizard.context.results[3]) {
            return Promise.resolve(this.wizard.context.results[3]);
        }

        return Promise.resolve("");
    }
}
