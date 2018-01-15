export interface IFolderCreator {
    createFolder(name: string): Promise<void>;
}

export function isFolderCreator(obj: any) {
    let folderCreator = <IFolderCreator> obj;
    return folderCreator.createFolder !== undefined;
}