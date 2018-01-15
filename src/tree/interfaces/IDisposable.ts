export interface IDisposable {
    dispose(): void;
}

export function isDisposable(obj: any) {
    let deletable = <IDisposable> obj;
    return deletable.dispose !== undefined;
}