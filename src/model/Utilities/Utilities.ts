import * as path from "path";
import * as fs from "../../async/fs";
import { DirectorySearchResult } from "./DirectorySearchResult";

export async function searchFilesInDir(startPath:string, extension: string) : Promise<string[]> {
    if (!(await fs.exists(startPath))) {
        return [];
    }

    let result: string[] = [];
    let files = await fs.readdir(startPath);
    for (let i = 0; i < files.length; i++) {
        let filename = path.join(startPath, files[i]);
        let stat = await fs.lstat(filename);
        if (filename.endsWith(extension)) {
            result.push(filename);
        }
    }
    
    return result;
}

export async function getDirectoryItems (dirPath: string): Promise<DirectorySearchResult> {
    if (!(await fs.exists(dirPath))) {
        throw "Directory doesn't exist";
    }

    let directories = [],  files = []
    let items = await fs.readdir(dirPath);
    for(let i = 0; i < items.length; i++){
        let filename = path.join(dirPath, items[i]);
        let stat = await fs.lstat(filename);
        if (stat.isDirectory()){
            directories.push(filename);
        }
        else {
            files.push(filename);
        }
    }

    directories.sort((a, b) => {
        let x = a.toLowerCase();
        let y = b.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });
    
    files.sort((a, b) => {
        let x = a.toLowerCase();
        let y = b.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });

    return new DirectorySearchResult(directories, files);
}

export async function getAllDirectoriesRecursive(dirPath: string, ignore?:string[]): Promise<string[]> {
    if (!(await fs.exists(dirPath))) {
        throw "Directory doesn't exist";
    }

    let result: string[] = [];
    let items = await fs.readdir(dirPath);
    for(let i = 0; i < items.length; i++){
        if (ignore && ignore.indexOf(items[i].toLocaleLowerCase()) >= 0) continue;
        let filename = path.join(dirPath, items[i]);
        let stat = await fs.lstat(filename);
        if (stat.isDirectory()){
            result.push(filename);
            let subDirs = await getAllDirectoriesRecursive(filename);
            subDirs.forEach(path => {
                result.push(path);
            });;
        }
    }

    result.sort((a, b) => {
        let x = a.toLowerCase();
        let y = b.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });

    return result;
}

export async function createCopyName(filepath: string): Promise<string> {
    let counter = 1;
    let ext = path.extname(filepath);
    let name = path.basename(filepath, ext);
    let folder = path.dirname(filepath);
    while (await fs.exists(filepath)) {   
        filepath = path.join(folder, name + '.' + counter + ext);
        counter++;
    }

    return filepath;
}