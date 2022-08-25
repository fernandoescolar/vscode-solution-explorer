import * as path from "@extensions/path";
import * as dialogs from "@extensions/dialogs";
import { Project } from "@core/Projects";
import { Action, ActionContext } from "./base/Action";

type MoveFileOptions = 'Overwrite' | 'Keep Both' | 'Skip' | 'Cancel';

export class MoveProjectFile implements Action {
    constructor(private readonly project: Project, private readonly sourcePath: string, private readonly targetPath: string) {
    }

    public toString(): string {
        return `Move file ${this.sourcePath} to ${this.targetPath} in project ${this.project.name}`;
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) { return; }

        const stat = await this.project.statFile(this.sourcePath, this.targetPath);
        if (!stat.exists) {
            await this.project.moveFile(this.sourcePath, this.targetPath);
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

        if (option === 'Overwrite') {
            await this.project.deleteFile(stat.fullpath);
            await this.project.moveFile(this.sourcePath, this.targetPath);
            return;
        }

        if (option === 'Keep Both') {
            const extension = path.extname(this.sourcePath);
            const name = path.basename(this.sourcePath, extension);
            const copyName = `${name}_copy${extension}`;
            await this.project.renameFile(this.sourcePath, copyName);
            const copyPath = path.join(path.dirname(this.sourcePath), copyName);
            await this.project.moveFile(copyPath, this.targetPath);
            return;
        }
    }

    private async showOptions(context: ActionContext): Promise<MoveFileOptions> {
        const filename = path.basename(this.sourcePath);
        const options = ['Overwrite', 'Keep Both', 'Skip'];
        if (context.overwriteAll) {
            return 'Overwrite';
        }

        if (context.keepBothAll) {
            return 'Keep Both';
        }

        if (context.skipAll) {
            return 'Skip';
        }

        if (context.multipleActions) {
            options.push('Overwrite All', 'Keep Both All', 'Skip All');
        }

        const option = await dialogs.confirm(`Are you sure you want to move '${filename}' overriding the existing file?`, ...options);

        if (option === 'Overwrite All') {
            context.overwriteAll = true;
            return 'Overwrite';
        }

        if (option === 'Keep Both All') {
            context.keepBothAll = true;
            return 'Keep Both';
        }

        if (option === 'Skip All') {
            context.skipAll = true;
            return 'Skip';
        }

        if (!option) {
            return 'Cancel';
        }

        return option as MoveFileOptions;
    }
}
