export type ActionContext = { multipleActions: boolean, overwriteAll: boolean, keepBothAll: boolean, skipAll: boolean, cancelled: boolean };

export type FileOptions = 'Overwrite' | 'Keep Both' | 'Skip' | 'Cancel';

export type FolderOptions = 'Skip' | 'Cancel';

export interface Action {
    execute(context: ActionContext): Promise<void>;
}
