export interface IMovable {
    getFolders(): Promise<string[]>;
    move(folderpath: string): Promise<string>;
}

export function isMovable(obj: any) {
    let folderCreator = <IMovable> obj;
    return folderCreator.move !== undefined;
}