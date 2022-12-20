import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import * as dialogs from "@extensions/dialogs";
import { Project } from "@core/Projects";
import { Action, ActionContext } from "./base/Action";

export class RenameProjectFolder implements Action {
    constructor(private readonly project: Project, private readonly folderPath: string,  private readonly oldfoldername: string, private readonly newfoldername: string) {
    }

    public toString(): string {
        return `Rename folder ${this.folderPath} to ${this.newfoldername} in project ${this.project.name}`;
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) {
            return;
        }

        const parentFolderPath = path.dirname(this.folderPath);
        const newfolderPath = path.join(parentFolderPath, this.newfoldername);
        const isTheSameFolderThanProject = this.folderPath.startsWith(path.dirname(this.project.fullPath));
        if (newfolderPath === this.folderPath && isTheSameFolderThanProject) {
            return;
        }

        const caseChanged = this.folderPath.toLowerCase() === newfolderPath.toLowerCase();
        if (await fs.exists(newfolderPath) && isTheSameFolderThanProject && !caseChanged) {
            await dialogs.showError("Folder already exists");
            return;
        }

        await this.project.renameFolder(this.folderPath, this.oldfoldername, this.newfoldername);
    }
}
