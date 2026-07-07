import * as vscode from "vscode";
import { t } from "@extensions/translations";
import * as msBuildPropertyOverrides from "@extensions/msBuildPropertyOverrides";
import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { ContextValues, TreeItem } from "@tree";
import { Action, RefreshTree, RefreshTreeItem, SetMsBuildPropertyOverrides } from "@actions";
import { SingleItemActionsCommand } from "@commands";
import { showMsBuildPropertiesForm } from "../webviews/MsBuildPropertiesWebview";

export class EditMsBuildPropertiesCommand extends SingleItemActionsCommand {
    constructor(private readonly context: vscode.ExtensionContext, private readonly provider: SolutionExplorerProvider) {
        super('Edit MSBuild Properties');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        if (!item || !item.solution) { return false; }
        return this.isSolutionRoot(item) || (!!item.project && ContextValues.matchAnyLanguage(ContextValues.project, item.contextValue));
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
        if (!item) { return []; }

        const isSolution = this.isSolutionRoot(item);
        const fullPath = isSolution ? item.solution.fullPath : item.project?.fullPath;
        if (!fullPath) { return []; }

        const current = msBuildPropertyOverrides.getOverrides(fullPath);
        const effective = isSolution || !item.project ? {} : await item.project.getProperties();
        const targetFrameworkChoices = (effective['TargetFrameworks'] ?? '')
            .split(';')
            .map(tf => tf.trim())
            .filter(tf => tf.length > 0);

        const values = await showMsBuildPropertiesForm(this.context, {
            title: t("Edit MSBuild Properties - {0}", item.label),
            current,
            targetFrameworkChoices
        });

        if (values === undefined) { return []; }

        return [
            new SetMsBuildPropertyOverrides(fullPath, values),
            isSolution ? new RefreshTree(this.provider) : new RefreshTreeItem(item)
        ];
    }

    private isSolutionRoot(item: TreeItem): boolean {
        return item.contextValue === ContextValues.solution || item.contextValue === ContextValues.solution + '-cps';
    }
}
