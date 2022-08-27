import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import * as dialogs from "@extensions/dialogs";
import { Project } from "@core/Projects";
import { createCopyName } from "@core/Utilities";
import { Action, ActionContext } from "./base/Action";

type CopyFileOptions = 'Overwrite' | 'Keep Both' | 'Skip' | 'Cancel';

export class CopyProjectFile implements Action {
    constructor(private readonly project: Project, private readonly sourcePath: string, private readonly targetPath: string) {
    }

    public toString(): string {
        return `Copy file ${this.sourcePath} to ${this.targetPath} in project ${this.project.name}`;
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) { return; }

        const content = await fs.readFile(this.sourcePath);
        const stat = await this.project.statFile(this.sourcePath, this.targetPath);
        const folderPath = path.dirname(stat.fullpath);
        const filename = path.basename(stat.fullpath);
        if (!stat.exists) {
            await this.project.createFile(folderPath, filename, content);
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

        if (option === 'Overwrite') {
            await fs.writeFile(stat.fullpath, content);
            return;
        }

        if (option === 'Keep Both') {
            const copyPath = await createCopyName(stat.fullpath);
            this.project.createFile(folderPath, path.basename(copyPath), content);
            return;
        }

        if (option === 'Skip') {
            return;
        }
    }

    private async showOptions(context: ActionContext): Promise<CopyFileOptions> {
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

        return option as CopyFileOptions;
    }
}
