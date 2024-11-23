import { TreeItem } from "@tree";
import { SingleItemActionsCommand } from "@commands";
import { Action, DotNetAddProjectReference } from "@actions";
import * as dialogs from '@extensions/dialogs';

export class AddProjectReferenceCommand extends SingleItemActionsCommand {

    constructor() {
        super('Add project reference');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return !!item && !!item.project && item.project.type === 'cps';
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
        if (!item || !item.project) { return []; }

        const projectPath = await dialogs.selectOption('Select project...', () => this.getCPSProjects(item));
        if (!projectPath) { return []; }

        return [ new DotNetAddProjectReference(item.project.fullPath, projectPath) ];
    }

    private getCPSProjects(item: TreeItem): Promise<{[id: string]: string}> {
        let result: {[id: string]: string} = {};
        item.solution.getAllProjects().forEach(p => {
            if (item.project && item.project.fullPath === p.fullPath) { return false; }
            const projectName = p.getFullDisplayName();
            result[p.getFullDisplayName()] = p.fullPath || '';

        });

        return Promise.resolve(result);
    }
}
