import * as vscode from "vscode";
import { Action, ActionContext } from "./base/Action";
import { Project, Reference } from "@core/Projects";
import * as path from "@extensions/path";

export class AddAssemblyReference implements Action {
    constructor(private readonly project: Project, private readonly filePath: string) {
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) {
            return;
        }
        const relativePath = path.relative(path.dirname(this.project.fullPath), this.filePath);
        const name = path.basename(this.filePath, path.extname(this.filePath));
        const reference = new Reference(name, undefined, relativePath);
        await this.project.addReference(reference);
    }

    public toString(): string {
        return `Add dll file ${this.filePath} to ${this.project.name} project`;
    }
}
