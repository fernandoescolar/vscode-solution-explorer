export type ActionContext = { multipleActions: boolean, yesAll: boolean, overwriteAll: boolean, keepBothAll: boolean, skipAll: boolean, cancelled: boolean };

export interface Action {
    execute(context: ActionContext): Promise<void>;
    toString(): string;
}

