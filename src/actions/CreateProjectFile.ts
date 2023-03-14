import { Project } from "@core/Projects";
import { Action, ActionContext } from "./base/Action";
import { RelativeFilePosition } from "@core/Projects/RelativeFilePosition";

export class CreateProjectFile implements Action {
    constructor(private readonly project: Project, private readonly folderPath: string, private readonly filename: string, 
        private readonly content?: string, private readonly relativePosition?:RelativeFilePosition) {
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) {
            return;
        }

        await this.project.createFile(this.folderPath, this.filename, this.content, this.relativePosition);
    }

    public toString(): string {
        return `Create file ${this.filename} in project ${this.project.name}`;
    }
}
