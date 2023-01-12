import * as path from "@extensions/path";
import * as dialogs from "@extensions/dialogs";
import { Project } from "@core/Projects";
import { Action, ActionContext } from "./base/Action";

type  DeleteProjectFolderOptions = 'Yes' | 'Skip' | 'Cancel';

export class DeleteProjectFolder implements Action {
    constructor(private readonly project: Project, private readonly folderPath: string, private readonly showDialog?: boolean) {
    }

    public toString(): string {
        return `Delete folder ${this.folderPath} from project ${this.project.name}`;
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) {
            return;
        }

        const option = await this.showOptions(context);
        if (option === 'Yes') {
            await this.project.deleteFolder(this.folderPath);
        }
    }

    private async showOptions(context: ActionContext): Promise<DeleteProjectFolderOptions> {
        if (this.showDialog === false) {
            return 'Yes';
        }
        const filename = path.basename(this.folderPath);
        const options = ['Yes', 'Skip'];
        if (context.yesAll) {
            return 'Yes';
        }

        if (context.skipAll) {
            return 'Skip';
        }

        if (context.multipleActions) {
            options.push('Yes All', 'Skip All');
        }

        const option = await dialogs.confirm(`Are you sure you want to delete '${filename}'?`, ...options);

        if (option === 'Yes All') {
            context.yesAll = true;
            return 'Yes';
        }

        if (option === 'Skip All') {
            context.skipAll = true;
            return 'Skip';
        }

        if (!option) {
            return 'Cancel';
        }

        return option as DeleteProjectFolderOptions;
    }
}
