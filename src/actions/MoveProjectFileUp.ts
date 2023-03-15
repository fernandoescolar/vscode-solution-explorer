import { Project } from "@core/Projects";
import { Action, ActionContext } from "./base/Action";

export class MoveProjectFileUp implements Action {
    constructor(private readonly project: Project, private readonly sourcePath: string) {
    }

    public toString(): string {
        return `Move file ${this.sourcePath} up in project ${this.project.name}`;
    }


    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) { return; }
        await this.project.moveFileUp(this.sourcePath);
    }
}
