import { Project } from "@core/Projects";
import { Action, ActionContext } from "./base/Action";

export class CreateProjectFolder implements Action {
    constructor(private readonly project: Project, private readonly folderPath: string) {
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) {
            return;
        }

        await this.project.createFolder(this.folderPath);
    }

    public toString(): string {
        return `Create folder ${this.folderPath} in project ${this.project.name}`;
    }
}
