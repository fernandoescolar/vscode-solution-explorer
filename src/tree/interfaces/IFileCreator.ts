export interface IFileCreator {
    createFile(name: string): Promise<string>;
}

export function isFileCreator(obj: any) {
    let fileCreator = <IFileCreator> obj;
    return fileCreator.createFile !== undefined;
}