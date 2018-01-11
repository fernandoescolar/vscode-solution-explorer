export interface IRefreshable {
    refresh(): void;
}

export function isRefreshable(obj: any) {
    let refreshable = <IRefreshable> obj;
    return refreshable.refresh !== undefined;
}