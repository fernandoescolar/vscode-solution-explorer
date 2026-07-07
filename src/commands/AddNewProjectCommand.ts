import * as path from "@extensions/path";
import * as dialogs from '@extensions/dialogs';
import { ContextValues, TreeItem } from "@tree";
import { Action, DotNetAddExistingProject, DotNetCreateProject } from '@actions';
import { SingleItemActionsCommand } from "@commands";
import { SolutionExplorerProvider } from '@SolutionExplorerProvider';
import { listProjectTemplates } from '@extensions/dotnetTemplates';

export class AddNewProjectCommand extends SingleItemActionsCommand {
    private wizard: dialogs.Wizard | undefined;

    constructor(private readonly provider: SolutionExplorerProvider) {
        super('Add new project');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return !item || (item && !!item.path && (item.contextValue === ContextValues.solution || item.contextValue === ContextValues.solution + '-cps'));
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
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

    private getProjectTypes(): { [id: string]: string } {
        let result: { [id: string]: string } = {};
        listProjectTemplates().forEach(pt => {
            result[pt.name] = pt.shortName;
        });
        return result;
    }

    private getLanguages(): Promise<string[]> {
        let result: string[] = ['C#'];
        if (this.wizard && this.wizard.context && this.wizard.context.results[1]) {
            let selectedProject = this.wizard.context.results[1];
            let index = listProjectTemplates().findIndex(pt => pt.shortName === selectedProject);
            if (index >= 0) {
                result = listProjectTemplates()[index].languages;
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
