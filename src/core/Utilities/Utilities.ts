import * as path from "@extensions/path";
import * as fs from "@extensions/fs";
import { DirectorySearchResult } from "./DirectorySearchResult";

export async function searchFilesInDir(startPath:string, extensions: string[], recursive: boolean = false) : Promise<string[]> {
    if (!(await fs.exists(startPath))) {
        return [];
    }

    let result: string[] = [];
    let files = await fs.readdir(startPath);
    for (let i = 0; i < files.length; i++) {
        let filename = path.join(startPath, files[i]);
        extensions.some(ext => {
            if (filename.endsWith(ext)) {
                result.push(filename);
                return true;
            }
            return false;
        });

        if (recursive) {
            let isDirectory = await fs.isDirectory(filename);
            if (isDirectory) {
                let subresult = await searchFilesInDir(filename, extensions, recursive);
                result = result.concat(subresult);
            }
        }
    }

    return result;
}

export async function listFilesAndDirectoriesRecursive(searchPath: string) : Promise<string[]> {
    const result: string[] = [];
    const files = await fs.readdir(searchPath);
    for (let i = 0; i < files.length; i++) {
        const filename = path.join(searchPath, files[i]);
        result.push(filename);
        const isDirectory = await fs.isDirectory(filename);
        if (isDirectory) {
            const subresult = await listFilesAndDirectoriesRecursive(filename);
            result.push(...subresult);
        }
    }

    return result;
}

export async function getDirectoryItems (dirPath: string): Promise<DirectorySearchResult> {
    if (!(await fs.exists(dirPath))) {
        throw new Error("Directory doesn't exist");
    }

    let directories = [],  files = [];
    let items = await fs.readdir(dirPath);
    for(let i = 0; i < items.length; i++){
        let filename = path.join(dirPath, items[i]);
        let isDirectory = await fs.isDirectory(filename);
        if (isDirectory){
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
        throw new Error("Directory doesn't exist");
    }

    let result: string[] = [];
    let items = await fs.readdir(dirPath);
    for(let i = 0; i < items.length; i++){
        if (ignore && ignore.indexOf(items[i].toLocaleLowerCase()) >= 0) { continue; }
        let filename = path.join(dirPath, items[i]);
        let isDirectory = await fs.isDirectory(filename);
        if (isDirectory){
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
        filepath = path.join(folder, name + ' copy' + (counter > 1 ? " " + counter : "")+ ext);
        counter++;
    }

    return filepath;
}