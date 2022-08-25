import * as path from "@extensions/path";
import * as dialogs from "@extensions/dialogs";
import { Project } from "@core/Projects";
import { Action, ActionContext } from "./base/Action";

type MoveFolderOptions = 'Skip' | 'Cancel';

export class MoveProjectFolder implements Action {
    constructor(private readonly project: Project, private readonly sourcePath: string, private readonly targetPath: string) {
    }

    public toString(): string {
        return `Move folder ${this.sourcePath} to ${this.targetPath} in project ${this.project.name}`;
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) { return; }

        const stat = await this.project.statFile(this.sourcePath, this.targetPath);
        if (!stat.exists) {
            await this.project.moveFolder(this.sourcePath, this.targetPath);
            return;
        }

        if (stat.fullpath === this.sourcePath) {
            // is the same file
            return;
        }

        const option = await this.showOptions(context);
        if (option === 'Cancel') {
            context.cancelled = true;
            return;
        }

        if (option === 'Skip') {
            return;
        }
    }

    private async showOptions(context: ActionContext): Promise<MoveFolderOptions> {
        const foldername = path.basename(this.sourcePath);
        const options = [];

        if (context.skipAll) {
            return 'Skip';
        }

        if (context.multipleActions) {
            options.push('Skip', 'Skip All');
        }

        const option = await dialogs.confirm(`There is already a folder named '${foldername}'`, ...options);

        if (option === 'Skip All') {
            context.skipAll = true;
            return 'Skip';
        }

        if (!option) {
            return 'Cancel';
        }

        return option as MoveFolderOptions;
    }
}
