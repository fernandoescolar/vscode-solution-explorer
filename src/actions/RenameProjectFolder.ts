import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import * as dialogs from "@extensions/dialogs";
import { Project } from "@core/Projects";
import { Action, ActionContext } from "./base/Action";

export class RenameProjectFolder implements Action {
    constructor(private readonly project: Project, private readonly folderPath: string, private readonly foldername: string) {
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) {
            return;
        }

        const parentFolderPath = path.dirname(this.folderPath);
        const newfolderPath = path.join(parentFolderPath, this.foldername);
        if (newfolderPath === this.folderPath) {
            return;
        }

        if (await fs.exists(newfolderPath)) {
            await dialogs.showError("Folder already exists");
            return;
        }

        await this.project.renameFolder(this.folderPath, this.foldername);
    }
}
