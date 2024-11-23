import { TreeItem, ContextValues } from "@tree";
import { ActionCommandContext, ActionsCommand, prepareContextActionGetters } from "@commands";
import {
    Action,
    DeleteProjectFile,
    DeleteProjectFolder,
    SlnDeleteSolutionFile,
    SlnDeleteSolutionFolder,
    DotNetRemoveExistingProject,
    DotNetRemovePackageReference,
    DotNetRemoveProjectReference,
    DeleteMultipleItems
} from "@actions";
import { SolutionType } from "@core/Solutions";

export class DeleteUnifiedCommand extends ActionsCommand {
    constructor() {
        super('Delete');
    }

    public async getActionsBase(ctx: ActionCommandContext): Promise<Action[]> {

        const clickedItems = this.getClickedItems(ctx.clickedItem, ctx.selectedItems);

        const topClickedItems = clickedItems.filter(item => !this.includedInFolder(clickedItems, item));

        if (topClickedItems.length === 1) {

            return this.getItemDeleteActions(topClickedItems[0], true);
        }
        else if (topClickedItems.length > 1) {

            const { both, cps, anyLang } = ContextValues;
            const allowedContextGroups = [
                anyLang(ContextValues.projectFile, ContextValues.projectFolder),
                cps(ContextValues.projectReferencedPackage, ContextValues.projectReferencedProject),
                both(ContextValues.project),
                [ContextValues.solutionFile, ContextValues.solutionFolder],
            ];
            const clickedContexts = [...new Set(topClickedItems.map((item) => item.contextValue))];
            const clickedGroups = [...new Set(clickedContexts
                .map(context => allowedContextGroups.findIndex(group => group.includes(context))))];

            if (clickedGroups.length !== 1 || clickedGroups[0] < 0) return [];

            const actions = topClickedItems.flatMap(item => this.getItemDeleteActions(item, false));
            const groupDescriptions = [
                'delete the selected items',
                'remove the selected references',
                'remove the selected projects',
                'delete the selected items'
            ];
            return [new DeleteMultipleItems(actions, groupDescriptions[clickedGroups[0]])];
        }

        return [];
    }

    private getClickedItems(clickedItem: TreeItem | undefined, selectedItems: readonly TreeItem[] | undefined) {

        selectedItems ??= [];
        const selectedItemsNotClicked = clickedItem && selectedItems.indexOf(clickedItem) < 0;
        return selectedItemsNotClicked ? [clickedItem] : selectedItems;
    }

    private getTreeItemParentsRecursive(item: TreeItem): TreeItem[] {

        const result: TreeItem[] = [];
        for (let current = item.parent; current; current = current.parent) {
            result.push(current);
        }
        return result;
    }

    private includedInFolder(clickedItems: readonly TreeItem[], item: TreeItem) {

        const parents = this.getTreeItemParentsRecursive(item);
        return parents.some(parent => clickedItems.includes(parent));
    }


    private getItemDeleteActions(item: TreeItem, showDialog: boolean): Action[] {

        const deleteActionGetters = showDialog
            ? this.preparedDeleteActionGettersShowDialog
            : this.preparedDeleteActionGettersHideDialog;
        const actionGetter = deleteActionGetters[item.contextValue];
        return actionGetter ? actionGetter(item) : [];
    }

    private preparedDeleteActionGettersShowDialog = this.prepareDeleteActionGetters(true);
    private preparedDeleteActionGettersHideDialog = this.prepareDeleteActionGetters(false);

    private prepareDeleteActionGetters(showDialog: boolean) {

        return prepareContextActionGetters([

            [ContextValues.projectFile, item => item.project && item.path
                ? [new DeleteProjectFile(item.project, item.path, showDialog)] : []],

            [ContextValues.projectFile, 'fs', item => item.project && item.path
                ? [new DeleteProjectFile(item.project, item.path, showDialog)] : []],

            [ContextValues.projectFolder, item => item.project && item.path
                ? [new DeleteProjectFolder(item.project, item.path, showDialog)] : []],

            [ContextValues.projectFolder, 'fs', item => item.project && item.path
                ? [new DeleteProjectFolder(item.project, item.path, showDialog)] : []],

            [ContextValues.projectReferencedPackage, 'cps', item => item.project && item.path
                ? [new DotNetRemovePackageReference(item.project.fullPath, item.path)] : []],

            [ContextValues.projectReferencedProject, 'cps', item => item.project && item.path
                ? [new DotNetRemoveProjectReference(item.project.fullPath, item.path)] : []],

            [ContextValues.project, item => item.project
                ? [new DotNetRemoveExistingProject(item.solution.fullPath, item.project.fullPath)] : []],

            [ContextValues.solutionFile, item => item.solution.type === SolutionType.Sln && item.solutionItem && item.path
                ? [new SlnDeleteSolutionFile(item.solution, item.solutionItem, item.path)] : []],

            [ContextValues.solutionFolder, item => item.solution.type === SolutionType.Sln && item.solutionItem
                ? [new SlnDeleteSolutionFolder(item.solution, item.solutionItem)] : []],
        ]);
    }
}
