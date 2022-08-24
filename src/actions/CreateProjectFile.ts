import { Project } from "@core/Projects";
import { Action, ActionContext } from "./base/Action";

export class CreateProjectFile implements Action {
    constructor(private readonly project: Project, private readonly folderPath: string, private readonly filename: string, private readonly content?: string) {
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) {
            return;
        }

        this.project.createFile(this.folderPath, this.filename, this.content);
    }
}
