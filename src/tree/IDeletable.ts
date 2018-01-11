export interface IDeletable {
    delete(): Promise<void>;
}

export function isDeletable(obj: any) {
    let deletable = <IDeletable> obj;
    return deletable.delete !== undefined;
}