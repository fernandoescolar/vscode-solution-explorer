import { Action, ActionContext } from "./base/Action";
import { Project, Reference } from "@core/Projects";

export class RemoveAssemblyReference implements Action {
    constructor(private readonly project: Project, private readonly reference: Reference) {
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) {
            return;
        }

        await this.project.removeReference(this.reference);
    }

    public toString(): string {
        return `Remove assembly reference ${this.reference.name} from ${this.project.name} project`;
    }
}
