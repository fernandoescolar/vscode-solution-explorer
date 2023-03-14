import { ProjectFileStat } from "../ProjectFileStat";
import { RelativeFilePosition } from "../RelativeFilePosition"; "../RelativeFilePosition";

export interface Manager {
    createFile(folderpath: string, filename: string, content?: string, relativePosition?:RelativeFilePosition): Promise<string>;
    createFolder(folderpath: string): Promise<string>;
    deleteFile(filepath: string): Promise<void>;
    deleteFolder(folderpath: string): Promise<void>;
    moveFile(filepath: string, newfolderPath: string): Promise<string>;
    moveFileUp(filepath: string): Promise<string>;
    moveFileDown(filepath: string): Promise<string>;
    moveFolder(folderpath: string, newfolderPath: string): Promise<string>;
    renameFile(filepath: string, name: string): Promise<string>;
    renameFolder(folderpath: string, name: string): Promise<string>;
    statFile(filepath: string, folderPath: string): Promise<ProjectFileStat>;
}
