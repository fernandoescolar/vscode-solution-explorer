import * as vscode from "vscode";
import * as path from "@extensions/path";
import * as dialogs from "@extensions/dialogs";
import { t } from "@extensions/translations";
import { ContextValues, TreeItem } from "@tree";
import { Action, DotNetAddExistingProject, DotNetCreateProject } from "@actions";
import { SingleItemActionsCommand } from "@commands";
import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { listProjectTemplates } from "@extensions/dotnetTemplates";
import { showAddNewProjectPanel } from "../webviews/AddNewProjectWebview";

export class AddNewProjectUICommand extends SingleItemActionsCommand {
    constructor(private readonly context: vscode.ExtensionContext, private readonly provider: SolutionExplorerProvider) {
        super('Add new project (ui)');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return !item || (item && !!item.path && (item.contextValue === ContextValues.solution || item.contextValue === ContextValues.solution + '-cps'));
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
        const solution = await this.resolveSolution(item);
        if (!solution) { return []; }

        const templates = listProjectTemplates();
        const defaultLocation = path.dirname(solution);

        const result = await showAddNewProjectPanel(this.context, {
            title: t('Add new project'),
            defaultLocation,
            templates
        });

        if (!result) { return []; }

        const { templateShortName, language, projectName, location, framework } = result;
        let projectFolder = path.join(location, projectName);
        let projectPath = path.join(projectFolder, projectName);
        if (language === 'C#') { projectPath += '.csproj'; }
        if (language === 'F#') { projectPath += '.fsproj'; }
        if (language === 'VB') { projectPath += '.vbproj'; }

        const solutionPath = path.dirname(solution);
        projectFolder = path.relative(solutionPath, projectFolder);


        return [
            new DotNetCreateProject(templateShortName, language, projectName, projectFolder, solutionPath, framework),
            new DotNetAddExistingProject(solution, projectPath)
        ];
    }

    private async resolveSolution(item: TreeItem | undefined): Promise<string | undefined> {
        if (item && item.path) { return item.path; }

        const solutions: { [id: string]: string } = {};
        const children = await this.provider.getChildren();
        if (!children) { return undefined; }

        children.forEach(child => {
            if (child && child.path) { solutions[child.label] = child.path; }
        });

        const keys = Object.keys(solutions);
        if (keys.length === 0) { return undefined; }
        if (keys.length === 1) { return solutions[keys[0]]; }

        return dialogs.selectOption(t('Select solution'), solutions);
    }
}
