import * as path from 'path';
import * as fs from 'fs';
import { DirectorySearchResult } from './DirectorySearchResult';

export function searchFilesInDir(startPath:string, extension: string) : Thenable<string[]> {
    var result: string[] = []
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(startPath)){
            return reject("Directory doesn't exist");
        }

        var files = fs.readdir(startPath, (err, files) => {
            if (err) {
                return reject(err);
            }

            files.forEach(file => {
                var filename = path.join(startPath, file);
                var stat = fs.lstatSync(filename);
                if (filename.endsWith(extension)) {
                    result.push(filename);
                }
            });

            resolve(result);
        });
    });
}

export function getDirectoryItems (dirPath: string): Thenable<DirectorySearchResult> {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(dirPath)){
            return reject("Directory doesn't exist");
        }

        var directories = [],  files = []
        var items = fs.readdirSync(dirPath);
        for(var i = 0; i < items.length; i++){
            var filename = path.join(dirPath, items[i]);
            var stat = fs.lstatSync(filename);
            if (stat.isDirectory()){
                directories.push(items[i]);
            }
            else {
                files.push(items[i])
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

        resolve(new DirectorySearchResult(directories, files));
    });
}

export function getDirectoryItemsSync(dirPath: string): DirectorySearchResult {
    if (!fs.existsSync(dirPath)){
        return null;
    }

    var directories = [],  files = []
    var items = fs.readdirSync(dirPath);
    for(var i = 0; i < items.length; i++){
        var filename = path.join(dirPath, items[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()){
            directories.push(items[i]);
        }
        else {
            files.push(items[i])
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