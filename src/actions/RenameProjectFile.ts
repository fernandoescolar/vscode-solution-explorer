import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import * as dialogs from "@extensions/dialogs";
import { Project } from "@core/Projects";
import { Action, ActionContext } from "./base/Action";

export class RenameProjectFile implements Action {
    constructor(private readonly project: Project, private readonly filePath: string, private readonly filename: string) {
    }

    public toString(): string {
        return `Rename file ${this.filePath} to ${this.filename} in project ${this.project.name}`;
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) {
            return;
        }

        const parentFolderPath = path.dirname(this.filePath);
        const newfilePath = path.join(parentFolderPath, this.filename);
        if (newfilePath === this.filePath) {
            return;
        }

        const caseChanged = this.filePath.toLowerCase() === newfilePath.toLowerCase();
        if (await fs.exists(newfilePath) && !caseChanged) {
            await dialogs.showError("File already exists");
            return;
        }

        await this.project.renameFile(this.filePath, this.filename);
    }
}

