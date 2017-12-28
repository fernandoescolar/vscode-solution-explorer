import * as path from "path";
import * as fs from "../../async/fs";
import { DirectorySearchResult } from "./DirectorySearchResult";

export async function searchFilesInDir(startPath:string, extension: string) : Promise<string[]> {
    if (!(await fs.exists(startPath))) {
        throw "Directory doesn't exist";
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

    var directories = [],  files = []
    var items = await fs.readdir(dirPath);
    for(var i = 0; i < items.length; i++){
        var filename = path.join(dirPath, items[i]);
        var stat = await fs.lstat(filename);
        if (stat.isDirectory()){
            directories.push(filename);
        }
        else {
            files.push(filename);
        }
    }

    directories.sort((a, b) => {
        var x = a.toLowerCase();
        var y = b.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });
    
    files.sort((a, b) => {
        var x = a.toLowerCase();
        var y = b.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });

    return new DirectorySearchResult(directories, files);
}