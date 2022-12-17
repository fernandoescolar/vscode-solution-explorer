import * as dialogs from "@extensions/dialogs";
import { TemplateEngineCollection } from "@templates";
import { Action, ActionContext } from "./base/Action";

export class InstallWorkspaceTemplateFiles implements Action {
    constructor(private readonly templateEngineCollection: TemplateEngineCollection, private readonly workspace: string) {
    }

    public async execute(context: ActionContext): Promise<void> {
        if (await this.templateEngineCollection.exists(this.workspace)){
            if (await dialogs.confirm(`Template files already exist in ${this.workspace}. Do you want to overwrite them?`, 'Yes') !== 'Yes') {
                return;
            }
        }

        await this.templateEngineCollection.installTemplates(this.workspace);
    }

    public toString(): string {
        return `Install workspace template files in ${this.workspace}`;
    }
}
