import { TreeItem, ContextValues } from "@tree";
import { ActionsBaseCommand, prepareContextActionGetters } from "@commands";
import {
    Action,
    DeleteProjectFile,
    DeleteProjectFolder,
    DeleteSolutionFile,
    DeleteSolutionFolder,
    RemoveExistingProject,
    RemovePackageReference,
    RemoveProjectReference,
    DeleteMultipleItems
} from "@actions";

export class DeleteUnifiedCommand extends ActionsBaseCommand {
    constructor() {
        super('Delete');
    }
    
    public async getActionsBase(clickedItem: TreeItem | undefined, selectedItems: readonly TreeItem[] | undefined):
        Promise<Action[]> {
        
        const clickedItems = this.getClickedItems(clickedItem, selectedItems);
        
        const topClickedItems = clickedItems.filter(item => !this.includedInFolder(clickedItems, item));
    
        if (topClickedItems.length === 1) {

            return this.getItemDeleteActions(topClickedItems[0], true);
        }
        else if (topClickedItems.length > 1) {

            const actions: [context: string, action: Action[]][] = topClickedItems.map(item => [item.contextValue, this.getItemDeleteActions(item, false)]);

            const allowedContextGroups = [
                [ContextValues.projectFile, ContextValues.projectFolder],
                [ContextValues.projectReferencedPackage, ContextValues.projectReferencedProject],
                [ContextValues.project],
                [ContextValues.solutionFile, ContextValues.solutionFolder],
            ];

            const clickedContexts = [...new Set(actions.map(([context]) => context))];
            const clickedGroups = [...new Set(clickedContexts
                .map(context => context.replace('-cps', '').replace('-standard', ''))
                .map(context => allowedContextGroups.findIndex(group => group.indexOf(context) >= 0)))];
            
            if (clickedGroups.length > 1) return [];

            const question = clickedGroups[0] !== 2 ? 'delete the selected items' : 'remove the selected projects';
            
            return [new DeleteMultipleItems(actions.flatMap(([, actions]) => actions), question)];
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
            
            [ContextValues.projectFolder, item => item.project && item.path
                ? [new DeleteProjectFolder(item.project, item.path, showDialog)] : []],
            
            [ContextValues.projectReferencedPackage, 'cps', item => item.project && item.path
                ? [new RemovePackageReference(item.project.fullPath, item.path)] : []],
            
            [ContextValues.projectReferencedProject, 'cps', item => item.project && item.path
                ? [new RemoveProjectReference(item.project.fullPath, item.path)] : []],
            
            [ContextValues.project, item => item.project
                ? [new RemoveExistingProject(item.solution.fullPath, item.project.fullPath)] : []],
            
            [ContextValues.solutionFile, item => item.projectInSolution && item.path
                ? [new DeleteSolutionFile(item.solution, item.projectInSolution, item.path)] : []],
            
            [ContextValues.solutionFolder, item => item.projectInSolution
                ? [new DeleteSolutionFolder(item.solution, item.projectInSolution)] : []],
        ]);
    }
}
