import * as clipboard from "@extensions/clipboard";
import { Action, ActionContext } from "./base/Action";

export class Copy implements Action {
    constructor(private readonly content: string) {
    }

    public execute(context: ActionContext): Promise<void> {
        return clipboard.writeText(this.content);
    }

    public toString(): string {
        return `Copy: ${this.content}`;
    }

}


