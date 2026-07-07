import * as msBuildPropertyOverrides from "@extensions/msBuildPropertyOverrides";
import { Action, ActionContext } from "./base/Action";

export class SetMsBuildPropertyOverrides implements Action {
    constructor(private readonly fullPath: string, private readonly overrides: Record<string, string>) {
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) {
            return;
        }

        await msBuildPropertyOverrides.setOverrides(this.fullPath, this.overrides);
    }

    public toString(): string {
        return `Set MSBuild property overrides for ${this.fullPath}`;
    }
}
