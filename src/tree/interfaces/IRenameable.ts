export interface IRenameable {
    rename(name: string): Promise<void>;
}

export function isRenameable(obj: any) {
    let renameable = <IRenameable> obj;
    return renameable.rename !== undefined;
}